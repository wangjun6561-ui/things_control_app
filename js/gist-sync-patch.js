(() => {
  const STORAGE_KEY = 'taskbox_data';
  const GIST_ID = '90218455bf94dbce57dedabb07fa386a';
  const GIST_FILE = 'taskbox-backup.json';
  const TASKBOX_RAW_URL = `https://gist.githubusercontent.com/wangjun6561-ui/${GIST_ID}/raw/${GIST_FILE}`;
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

  function withGistSettings(data) {
    const next = data && typeof data === 'object' ? { ...data } : {};
    const settings = { ...(next.settings || {}) };
    const token = cleanToken(settings.githubToken || settings.cloudToken || '');
    next.settings = {
      ...settings,
      cloudEnabled: true,
      cloudProvider: 'gist',
      cloudEndpoint: TASKBOX_RAW_URL,
      cloudToken: token,
      githubToken: settings.githubToken || '',
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

  function getWriteToken() {
    const data = readData();
    return cleanToken(data?.settings?.githubToken || data?.settings?.cloudToken || '');
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init?.method || input?.method || 'GET').toUpperCase();

    if (isTaskboxGistWrite(url, method)) {
      const token = getWriteToken();
      if (!token) throw new Error('gist_token_missing');
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
      if (!response.ok) throw new Error('gist_patch_failed');
      return response;
    }

    return oldFetch(input, init);
  };

  window.__taskboxGistPatchReady = (async () => {
    const local = readData();
    if (hasLocalTaskboxData(local)) {
      writeData(withGistSettings(local));
      return;
    }

    try {
      const response = await oldFetch(TASKBOX_RAW_URL, { cache: 'no-store' });
      if (!response.ok) return;
      const remote = await response.json();
      writeData(withGistSettings(remote));
    } catch {
      // The app can still seed local data if the first remote read fails.
    }
  })();
})();
