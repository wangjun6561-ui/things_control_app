(() => {
  const STORAGE_KEY = 'taskbox_data';
  const BAD_TOKEN_KEY = 'taskbox_github_bad_token';
  const DATA_OWNER = 'liangzai4322';
  const DATA_REPO = 'things-control-data';
  const DATA_BRANCH = 'main';
  const DATA_RAW_BASE = `https://raw.githubusercontent.com/${DATA_OWNER}/${DATA_REPO}/${DATA_BRANCH}`;
  const FILES = {
    taskbox: 'taskbox-backup.json',
    points: 'mock-points.json',
    pavilion: 'pavilion.json',
    tower: 'tower.json',
  };
  const RAW_URLS = {
    [FILES.taskbox]: `${DATA_RAW_BASE}/${FILES.taskbox}`,
    [FILES.points]: `${DATA_RAW_BASE}/${FILES.points}`,
    [FILES.pavilion]: `${DATA_RAW_BASE}/${FILES.pavilion}`,
    [FILES.tower]: `${DATA_RAW_BASE}/${FILES.tower}`,
  };
  const LEGACY_GIST_IDS = new Set([
    '90218455bf94dbce57dedabb07fa386a',
    '6a56c7352da690f8aeca47262361243b',
  ]);
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
    window.TaskBoxApp?.showToast?.('GitHub Token 无效或缺少 repo 权限，已本地保存，暂停云端写回');
  }

  function filenameFromUrl(url = '') {
    const decoded = decodeURIComponent(String(url));
    return Object.values(FILES).find((filename) => decoded.includes(`/${filename}`) || decoded.endsWith(filename)) || '';
  }

  function legacyGistIdFromUrl(url = '') {
    const match = String(url).match(/(?:gist\.githubusercontent\.com\/[^/]+\/|api\.github\.com\/gists\/)([a-f0-9]+)/i);
    return match ? match[1] : '';
  }

  function isLegacyGistUrl(url = '') {
    const gistId = legacyGistIdFromUrl(url);
    return Boolean(gistId && LEGACY_GIST_IDS.has(gistId));
  }

  function normalizeUrl(value, filename) {
    const url = String(value || '').trim();
    if (!url || isLegacyGistUrl(url)) return RAW_URLS[filename];
    return url;
  }

  function withGitHubDataSettings(data) {
    const next = data && typeof data === 'object' ? { ...data } : {};
    const settings = { ...(next.settings || {}) };
    const token = cleanToken(settings.githubToken || settings.cloudToken || '');
    next.settings = {
      ...settings,
      cloudEnabled: true,
      cloudProvider: 'github',
      cloudEndpoint: normalizeUrl(settings.cloudEndpoint, FILES.taskbox),
      pointsDataUrl: normalizeUrl(settings.pointsDataUrl, FILES.points),
      pavilionDataUrl: normalizeUrl(settings.pavilionDataUrl, FILES.pavilion),
      towerDataUrl: normalizeUrl(settings.towerDataUrl, FILES.tower),
      cloudToken: '',
      githubToken: settings.githubToken || token,
    };
    next.meta = { ...(next.meta || {}), updatedAt: next.meta?.updatedAt || new Date().toISOString() };
    return next;
  }

  function hasLocalTaskboxData(data) {
    return Boolean(data && (Array.isArray(data.boxes) || Array.isArray(data.tasks)));
  }

  function toBase64Utf8(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  async function updateRepoFile(filename, content, token) {
    const clean = cleanToken(token);
    if (!clean || isTokenBlocked(clean)) {
      if (clean) showAuthFailedToast();
      return new Response(JSON.stringify({ message: 'github_auth_blocked' }), { status: 401 });
    }

    const apiBase = `https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/${encodeURIComponent(filename)}`;
    const currentResponse = await oldFetch(`${apiBase}?ref=${encodeURIComponent(DATA_BRANCH)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${clean}`,
      },
      cache: 'no-store',
    });
    if (currentResponse.status === 401 || currentResponse.status === 403) {
      rememberBadToken(clean, currentResponse.status);
      showAuthFailedToast();
      return currentResponse;
    }
    if (!currentResponse.ok) return currentResponse;
    const current = await currentResponse.json();

    const updateResponse = await oldFetch(apiBase, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${clean}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update ${filename}`,
        content: toBase64Utf8(`${content.replace(/\s*$/, '')}\n`),
        sha: current.sha,
        branch: DATA_BRANCH,
      }),
    });
    if (updateResponse.status === 401 || updateResponse.status === 403) {
      rememberBadToken(clean, updateResponse.status);
      showAuthFailedToast();
    }
    return updateResponse;
  }

  async function buildLegacyGistPayload() {
    const [taskbox, points, pavilion, tower] = await Promise.all(
      Object.values(FILES).map((filename) => oldFetch(RAW_URLS[filename], { cache: 'no-store' })
        .then((response) => response.ok ? response.text() : ''))
    );
    const contentByFile = {
      [FILES.taskbox]: taskbox,
      [FILES.points]: points,
      [FILES.pavilion]: pavilion,
      [FILES.tower]: tower,
    };
    return new Response(JSON.stringify({
      files: Object.fromEntries(Object.values(FILES).map((filename) => [
        filename,
        { content: contentByFile[filename], raw_url: RAW_URLS[filename] },
      ])),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    const filename = filenameFromUrl(url);

    if (method === 'GET' && filename && isLegacyGistUrl(url)) {
      return oldFetch(RAW_URLS[filename], { cache: init.cache || 'no-store' });
    }

    if (method === 'GET' && String(url || '').includes('api.github.com/gists/') && isLegacyGistUrl(url)) {
      return buildLegacyGistPayload();
    }

    if ((method === 'PATCH' || method === 'PUT') && filename && isLegacyGistUrl(url)) {
      const token = getBearerToken(init.headers) || cleanToken(readData()?.settings?.githubToken || '');
      const rawBody = typeof init.body === 'string' ? init.body : JSON.stringify(init.body || {});
      let content = rawBody;
      try {
        const parsed = JSON.parse(rawBody);
        content = parsed.files?.[filename]?.content || JSON.stringify(parsed, null, 2);
      } catch {
        // Keep the original body for raw PUT compatibility.
      }
      return updateRepoFile(filename, content, token);
    }

    return oldFetch(input, init);
  };

  async function primeFromGitHubDataRepo() {
    const local = readData();
    if (hasLocalTaskboxData(local)) {
      writeData(withGitHubDataSettings(local));
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    try {
      const response = await oldFetch(RAW_URLS[FILES.taskbox], { cache: 'no-store', signal: controller.signal });
      if (!response.ok) return;
      const remote = await response.json();
      writeData(withGitHubDataSettings(remote));
    } catch {
      // Do not block app boot if the first remote read is slow or unavailable.
    } finally {
      clearTimeout(timer);
    }
  }

  window.__taskboxGistPatchReady = Promise.race([
    primeFromGitHubDataRepo(),
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);
})();
