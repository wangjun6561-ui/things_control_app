import { getSettings, setSettings, exportData, importData, pushDataToCloud, pullDataFromCloud, exportDailySummary } from './db.js';
import { navigate, showToast } from './app.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderSettings(app) {
  const settings = getSettings();

  app.innerHTML = `
    <main id="settings" class="page settings-page">
      <header class="topbar safe-top">
        <button class="icon-btn icon-btn-ghost" id="backBtn">←</button>
        <h2>设置</h2>
        <span class="topbar-spacer"></span>
      </header>

      <section class="panel settings-hero">
        <p class="eyebrow">Preferences</p>
        <h3>同步、主题与数据管理</h3>
        <p class="settings-intro">把界面、云端同步和导入导出配置集中在这里，避免频繁切页查找。</p>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">AI</p>
            <h3>模型配置</h3>
          </div>
        </div>
        <label>DeepSeek API Key
          <div class="row gap8">
            <input id="apiKey" class="input" type="password" value="${escapeHtml(settings.deepseekApiKey || '')}" placeholder="sk-...">
            <button class="icon-btn" id="toggleKey" aria-label="显示或隐藏 API Key">👁</button>
          </div>
        </label>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Appearance</p>
            <h3>主题模式</h3>
          </div>
          <p class="panel-note">支持跟随系统、浅色和深色。</p>
        </div>
        <div class="tabs" id="themeTabs">
          ${[['system', '跟随系统'], ['light', '浅色'], ['dark', '深色']].map(([value, label]) => `
            <button class="tab ${settings.themeMode === value ? 'active' : ''}" data-theme="${value}">${label}</button>
          `).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="setting-row">
          <div>
            <p class="eyebrow">Audio</p>
            <h3>完成音效</h3>
            <p class="panel-note">任务勾选完成后播放提示音。</p>
          </div>
          <label class="switch">
            <input id="soundEnabled" type="checkbox" ${settings.soundEnabled ? 'checked' : ''}>
            <span></span>
          </label>
        </div>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Cloud Sync</p>
            <h3>云端同步</h3>
          </div>
          <p class="panel-note">多设备共享同一份 TaskBox 数据。</p>
        </div>

        <div class="setting-row">
          <div>
            <strong>启用云同步</strong>
            <p class="panel-note">开启后任务变更会自动尝试上传。</p>
          </div>
          <label class="switch">
            <input id="cloudEnabled" type="checkbox" ${settings.cloudEnabled ? 'checked' : ''}>
            <span></span>
          </label>
        </div>

        <label>云端接口 URL（支持 GET/PUT；JSONBin 可直接填 /v3/b/BinID）
          <input id="cloudEndpoint" class="input" value="${escapeHtml(settings.cloudEndpoint || '')}" placeholder="./cloud-sync.json 或 https://example.com/taskbox.json">
        </label>
        <label>访问令牌（可选）
          <input id="cloudToken" class="input" type="password" value="${escapeHtml(settings.cloudToken || '')}" placeholder="Bearer Token">
        </label>

        <div class="action-grid">
          <button class="btn" id="pullCloudBtn">从云端拉取</button>
          <button class="btn" id="pushCloudBtn">上传到云端</button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Data</p>
            <h3>数据管理</h3>
          </div>
          <p class="panel-note">导入会覆盖本地当前数据。</p>
        </div>
        <div class="action-grid">
          <button class="btn" id="exportBtn">导出数据</button>
          <button class="btn" id="importBtn">导入数据</button>
          <button class="btn" id="dailySummaryBtn">导出今日日报</button>
          <input id="importInput" type="file" accept="application/json" hidden>
        </div>
      </section>

      <section class="panel muted settings-about">
        <p class="eyebrow">About</p>
        <h3>TaskBox</h3>
        <small>v1.1.0 · 游戏化任务管理 PWA</small>
      </section>
    </main>
  `;

  app.querySelector('#backBtn').addEventListener('click', () => navigate('#home'));
  app.querySelector('#toggleKey').addEventListener('click', () => {
    const input = app.querySelector('#apiKey');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  app.querySelector('#apiKey').addEventListener('blur', (event) => {
    setSettings({ deepseekApiKey: event.target.value.trim() });
  });

  app.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    setSettings({ themeMode: tab.dataset.theme });
    renderSettings(app);
  }));

  app.querySelector('#soundEnabled').addEventListener('change', (event) => {
    setSettings({ soundEnabled: event.target.checked });
  });

  app.querySelector('#cloudEnabled').addEventListener('change', (event) => {
    setSettings({ cloudEnabled: event.target.checked });
  });
  app.querySelector('#cloudEndpoint').addEventListener('input', (event) => {
    setSettings({ cloudEndpoint: event.target.value.trim() });
  });
  app.querySelector('#cloudToken').addEventListener('input', (event) => {
    setSettings({ cloudToken: event.target.value.trim() });
  });

  const syncCloudSettings = () => {
    setSettings({
      cloudEnabled: app.querySelector('#cloudEnabled').checked,
      cloudEndpoint: app.querySelector('#cloudEndpoint').value.trim(),
      cloudToken: app.querySelector('#cloudToken').value.trim(),
    });
  };

  app.querySelector('#pullCloudBtn').addEventListener('click', async () => {
    syncCloudSettings();
    try {
      const result = await pullDataFromCloud({ force: true });
      if (result === 'merged') showToast('已与云端合并并去重');
      else showToast('本地已是最新');
      navigate('#home');
    } catch {
      showToast('云端拉取失败，请检查 URL 或 Token');
    }
  });

  app.querySelector('#pushCloudBtn').addEventListener('click', async () => {
    syncCloudSettings();
    try {
      await pushDataToCloud({ force: true });
      showToast('已上传到云端');
    } catch {
      showToast('云端上传失败，请检查 URL 或 Token');
    }
  });

  app.querySelector('#exportBtn').addEventListener('click', exportData);
  app.querySelector('#dailySummaryBtn').addEventListener('click', exportDailySummary);
  app.querySelector('#importBtn').addEventListener('click', () => app.querySelector('#importInput').click());
  app.querySelector('#importInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm('导入将覆盖当前所有数据，确认继续？')) return;
    try {
      await importData(file);
      showToast('导入成功');
      navigate('#home');
    } catch {
      showToast('导入失败，文件格式错误');
    }
  });
}
