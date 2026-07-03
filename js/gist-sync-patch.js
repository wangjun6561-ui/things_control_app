(() => {
  const STORAGE_KEY = 'taskbox_data';
  const BAD_TOKEN_KEY = 'taskbox_gist_bad_token';
  const GIST_ID = '90218455bf94dbce57dedabb07fa386a';
  const GIST_FILE = 'taskbox-backup.json';
  const POINTS_FILE = 'mock-points.json';
  const TASKBOX_RAW_URL = `https://gist.githubusercontent.com/wangjun6561-ui/${GIST_ID}/raw/${GIST_FILE}`;
  const POINTS_RAW_URL = `https://gist.githubusercontent.com/wangjun6561-ui/${GIST_ID}/raw/${POINTS_FILE}`;
  const GIST_API_URL = `https://api.github.com/gists/${GIST_ID}`;
  const oldFetch = window.fetch.bind(window);

  function readData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function cleanToken(value = '') {
    const token = String(value).trim().replace(/^\[|\]$/g, '');
    return token.startsWith('$2a$') ? '' : token;
  }

  function getHeader(headers, name) {
    if (!headers) return '';
    if (headers instanceof Headers) return headers.get(name) || '';
    const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
    return key ? headers[key] : '';
  }

  function getBearerToken(headers) {
    return String(getHeader(headers, 'Authorization')).replace(/^Bearer\s+/i, '').trim();
  }

  function tokenFingerprint(token = '') {
    const value = cleanToken(token);
    if (!value) return '';
    return `${value.slice(0, 6)}:${value.slice(-6)}`;
  }

  function readBadToken() {
    try {
      return JSON.parse(localStorage.getItem(BAD_TOKEN_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function isTokenBlocked(token) {
    const blocked = readBadToken();
    if (!blocked || blocked.fingerprint !== tokenFingerprint(token)) return false;
    return Date.now() - Number(blocked.at || 0) < 10 * 60 * 1000;
  }

  function rememberBadToken(token, status) {
    const fingerprint = tokenFingerprint(token);
    if (!fingerprint) return;
    localStorage.setItem(BAD_TOKEN_KEY, JSON.stringify({ fingerprint, status, at: Date.now() }));
  }

  function showAuthFailedToast() {
    window.TaskBoxApp?.showToast?.('GitHub Token 无效或缺少 gist 权限，已本地保存，暂停云端写回');
  }

  function withGistSettings(data) {
    const next = data && typeof data === 'object' ? { ...data } : {};
    const settings = { ...(next.settings || {}) };
    const token = cleanToken(settings.githubToken || settings.cloudToken || '');
    next.settings = {
      ...settings,
      cloudEnabled: true,
      cloudProvider: 'gist',
      cloudEndpoint: TASKBOX_RAW_URL,
      cloudToken: '',
      githubToken: settings.githubToken || token,
    };
    next.meta = { ...(next.meta || {}), updatedAt: next.meta?.updatedAt || new Date().toISOString() };
    return next;
  }

  function hasLocalTaskboxData(data) {
    return Boolean(data && (Array.isArray(data.boxes) || Array.isArray(data.tasks)));
  }

  function isTaskboxGistWrite(url, method) {
    return method === 'PUT'
      && String(url || '').includes(`/${GIST_ID}/raw/`)
      && String(url || '').includes(GIST_FILE);
  }

  function isManagedGistRawRead(url, method) {
    return method === 'GET'
      && String(url || '').includes(`/${GIST_ID}/raw/`)
      && [GIST_FILE, POINTS_FILE].some((filename) => String(url || '').includes(filename));
  }

  function isManagedGistApi(url) {
    return String(url || '').replace(/\/$/, '') === GIST_API_URL;
  }

  function getManagedRawUrl(url) {
    return String(url || '').includes(POINTS_FILE) ? POINTS_RAW_URL : TASKBOX_RAW_URL;
  }

  async function buildGistApiPayload() {
    const [taskbox, points] = await Promise.all([
      oldFetch(TASKBOX_RAW_URL, { cache: 'no-store' }).then((response) => response.ok ? response.text() : ''),
      oldFetch(POINTS_RAW_URL, { cache: 'no-store' }).then((response) => response.ok ? response.text() : ''),
    ]);
    return new Response(JSON.stringify({
      files: {
        [GIST_FILE]: { content: taskbox, raw_url: TASKBOX_RAW_URL },
        [POINTS_FILE]: { content: points, raw_url: POINTS_RAW_URL },
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  function getWriteToken() {
    const data = readData();
    return cleanToken(data?.settings?.githubToken || data?.settings?.cloudToken || '');
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || input?.method || 'GET').toUpperCase();

    if (isManagedGistRawRead(url, method)) {
      return oldFetch(getManagedRawUrl(url), { cache: init.cache || 'no-store' });
    }

    if (isManagedGistApi(url) && method === 'GET') {
      return buildGistApiPayload();
    }

    if (isManagedGistApi(url) && method === 'PATCH') {
      const token = getBearerToken(init.headers);
      if (!token || isTokenBlocked(token)) {
        if (token) showAuthFailedToast();
        return new Response(JSON.stringify({ message: 'gist_auth_blocked' }), { status: 401 });
      }
      const response = await oldFetch(input, init);
      if (response.status === 401 || response.status === 403) {
        rememberBadToken(token, response.status);
        showAuthFailedToast();
      }
      return response;
    }

    if (isTaskboxGistWrite(url, method)) {
      const token = getWriteToken();
      if (!token) throw new Error('gist_token_missing');
      if (isTokenBlocked(token)) {
        showAuthFailedToast();
        throw new Error('gist_auth_blocked');
      }
      const rawBody = typeof init.body === 'string' ? init.body : JSON.stringify(init.body || {});
      const content = JSON.stringify(JSON.parse(rawBody), null, 2);
      const response = await oldFetch(GIST_API_URL, {
        method: 'PATCH',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: { [GIST_FILE]: { content } } }),
      });
      if (response.status === 401 || response.status === 403) {
        rememberBadToken(token, response.status);
        showAuthFailedToast();
      }
      if (!response.ok) throw new Error('gist_patch_failed');
      return response;
    }

    return oldFetch(input, init);
  };

  async function primeFromGist() {
    const local = readData();
    if (hasLocalTaskboxData(local)) {
      writeData(withGistSettings(local));
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    try {
      const response = await oldFetch(TASKBOX_RAW_URL, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) return;
      const remote = await response.json();
      writeData(withGistSettings(remote));
    } catch {
      // Do not block app boot if the first remote read is slow or unavailable.
    } finally {
      clearTimeout(timer);
    }
  }

  window.__taskboxGistPatchReady = Promise.race([
    primeFromGist(),
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);
})();
