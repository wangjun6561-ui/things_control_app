import { navigate, openSheet, showToast } from './app.js';
import {
  ensurePointsData,
  getMilestoneBonuses,
  getPointPresets,
  getPointsSourceUrl,
  getPointsSummary,
  getRecentTransactions,
  getRewardCatalog,
  recordHistoricalBalance,
  recordPointsTransaction,
  redeemReward,
} from './points-store.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDelta(value) {
  const amount = Math.round(Number(value) || 0);
  return `${amount >= 0 ? '+' : '-'}${Math.abs(amount)} 分`;
}

function formatTime(value) {
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSourceLabel(pointsData) {
  const url = pointsData.meta.sourceUrl || getPointsSourceUrl();
  if (!url || url.endsWith('data/mock-points.json')) return '本地 mock JSON';
  if (url.includes('gist.githubusercontent.com')) return 'GitHub Gist';
  return '自定义 JSON';
}

function renderRuleCard(item) {
  return `
    <article class="points-rule-card">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${Math.round(Number(item.points) || 0)} 分</span>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
    </article>
  `;
}

function renderRewardCard(reward, balance) {
  const affordable = balance >= reward.cost;
  return `
    <article class="points-reward-card ${affordable ? '' : 'locked'}">
      <div class="points-reward-head">
        <span class="points-reward-icon">${escapeHtml(reward.icon || '🎁')}</span>
        <div>
          <strong>${escapeHtml(reward.title)}</strong>
          <p>${escapeHtml(reward.category)}</p>
        </div>
      </div>
      <p class="points-reward-desc">${escapeHtml(reward.description || '兑换后立即记账。')}</p>
      <div class="points-reward-foot">
        <span class="points-cost">${reward.cost} 分</span>
        <button class="btn ${affordable ? '' : 'subtle'} compact" data-redeem="${reward.id}" ${affordable ? '' : 'disabled'}>
          ${affordable ? '立即兑换' : '积分不足'}
        </button>
      </div>
    </article>
  `;
}

function renderTransaction(transaction) {
  const positive = Number(transaction.delta) >= 0;
  return `
    <article class="points-transaction ${positive ? 'positive' : 'negative'}">
      <span class="points-transaction-mark">${positive ? '+' : '-'}</span>
      <div class="points-transaction-body">
        <strong>${escapeHtml(transaction.title)}</strong>
        <p>${escapeHtml(transaction.note || '无备注')}</p>
        <small>${escapeHtml(formatTime(transaction.createdAt))}</small>
      </div>
      <span class="points-transaction-delta">${escapeHtml(formatDelta(transaction.delta))}</span>
    </article>
  `;
}

export async function renderPointsPage(app) {
  const pointsData = await ensurePointsData();
  const summary = getPointsSummary(pointsData);
  const pointPresets = getPointPresets(pointsData);
  const milestoneBonuses = getMilestoneBonuses(pointsData);
  const rewards = getRewardCatalog(pointsData);
  const transactions = getRecentTransactions(24, pointsData);
  const balance = summary.balance;

  app.innerHTML = `
    <main class="page points-page" id="points-page">
      <header class="topbar safe-top">
        <button class="icon-btn icon-btn-ghost" id="pointsBackBtn">←</button>
        <h2>积分</h2>
        <button class="icon-btn icon-btn-ghost" id="pointsSettingsBtn" aria-label="积分设置">⚙</button>
      </header>

      <section class="panel points-hero">
        <div class="points-hero-head">
          <div>
            <p class="eyebrow">Points System</p>
            <h1>把奖励和克制都记进账本</h1>
            <p class="panel-note">积分只跟已完成行为绑定，消费只通过兑换发生。这样每一分都能追溯。</p>
          </div>
          <span class="points-source-badge">${escapeHtml(getSourceLabel(pointsData))}</span>
        </div>

        <div class="points-balance-row">
          <div>
            <p class="points-balance-label">当前余额</p>
            <strong class="points-balance">${balance}</strong>
            <span class="points-balance-unit">${escapeHtml(pointsData.account.unit || '分')}</span>
          </div>
          <div class="points-hero-actions">
            <button class="btn subtle compact" id="pointsHistoryBtn">${summary.openingBalanceRecorded ? '继续补录' : '补录历史积分'}</button>
            <button class="btn subtle compact" id="pointsManualBtn">手动记一笔</button>
          </div>
        </div>

        <div class="hero-stats points-stats">
          <article class="stat-card">
            <span>今日新增</span>
            <strong>${summary.todayEarned}</strong>
          </article>
          <article class="stat-card">
            <span>今日消耗</span>
            <strong>${summary.todaySpent}</strong>
          </article>
          <article class="stat-card">
            <span>近 7 天净增</span>
            <strong>${summary.recentNet}</strong>
          </article>
        </div>
      </section>

      <section class="section-heading">
        <div>
          <p class="eyebrow">Rules</p>
          <h2>默认积分规则</h2>
        </div>
        <p class="section-note">先跑固定档位，后面再细化周计划。</p>
      </section>

      <section class="points-rule-grid">
        ${pointPresets.map(renderRuleCard).join('')}
        ${milestoneBonuses.map(renderRuleCard).join('')}
      </section>

      <section class="section-heading">
        <div>
          <p class="eyebrow">Rewards</p>
          <h2>奖励兑换</h2>
        </div>
        <p class="section-note">余额不够时，不允许直接消费。</p>
      </section>

      <section class="points-reward-grid">
        ${rewards.length
          ? rewards.map((reward) => renderRewardCard(reward, balance)).join('')
          : `
            <div class="empty-state points-empty">
              <div>🎁</div>
              <h3>还没有奖励池</h3>
              <p>先在 mock JSON 里放几个奖励，晚上我们再一起细化价格表。</p>
            </div>
          `}
      </section>

      <section class="section-heading">
        <div>
          <p class="eyebrow">Ledger</p>
          <h2>积分流水</h2>
        </div>
        <p class="section-note">最近 ${transactions.length} 笔，来源和去向都能查到。</p>
      </section>

      <section class="points-ledger">
        ${transactions.length
          ? transactions.map(renderTransaction).join('')
          : `
            <div class="empty-state points-empty">
              <div>🧾</div>
              <h3>还没有积分流水</h3>
              <p>先补录历史积分，或者完成第一条任务拿到第一笔积分。</p>
            </div>
          `}
      </section>
    </main>
  `;

  app.querySelector('#pointsBackBtn').addEventListener('click', () => navigate('#home'));
  app.querySelector('#pointsSettingsBtn').addEventListener('click', () => navigate('#settings'));
  app.querySelector('#pointsHistoryBtn').addEventListener('click', () => {
    openHistoricalSheet(() => renderPointsPage(app));
  });
  app.querySelector('#pointsManualBtn').addEventListener('click', () => {
    openManualTransactionSheet(() => renderPointsPage(app));
  });

  app.querySelectorAll('[data-redeem]').forEach((button) => {
    button.addEventListener('click', () => {
      const result = redeemReward(button.dataset.redeem);
      if (!result.ok) {
        showToast(result.reason === 'insufficient' ? '积分不够，先去完成任务攒分。' : '奖励兑换失败');
        return;
      }
      showToast(`已兑换 ${result.reward.title}，扣除 ${result.reward.cost} 分`);
      renderPointsPage(app);
    });
  });
}

function openHistoricalSheet(onDone) {
  const { root, close } = openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-content">
      <p class="eyebrow">Opening Balance</p>
      <h3>补录历史积分</h3>
      <p class="sheet-lead">把系统启用前已经攒下来的分数补录进来，这样旧账和新账就接上了。</p>
      <label>历史积分
        <input id="historyPoints" class="input" type="number" min="0" step="1" placeholder="例如 120">
      </label>
      <label>备注
        <textarea id="historyNote" class="input" rows="3" placeholder="例如：4 月中旬前历史累计积分">${escapeHtml('系统启用前历史累计积分')}</textarea>
      </label>
      <div class="sheet-actions">
        <button class="btn" id="historyCancelBtn">取消</button>
        <button class="btn primary" id="historySaveBtn">补录</button>
      </div>
    </div>
  `, { height: '52vh' });

  root.querySelector('#historyCancelBtn').addEventListener('click', close);
  root.querySelector('#historySaveBtn').addEventListener('click', () => {
    const points = Math.max(0, Number(root.querySelector('#historyPoints').value) || 0);
    if (!points) {
      showToast('先填一个有效的历史积分数值');
      return;
    }
    const note = root.querySelector('#historyNote').value.trim();
    recordHistoricalBalance(points, note || '系统启用前历史累计积分');
    close();
    showToast(`历史积分已补录 +${points} 分`);
    onDone?.();
  });
}

function openManualTransactionSheet(onDone) {
  const { root, close } = openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-content">
      <p class="eyebrow">Manual Entry</p>
      <h3>手动记一笔积分</h3>
      <p class="sheet-lead">用于临时奖励、手动支出或规则修正，不会替代任务完成自动记分。</p>
      <label>标题
        <input id="pointsTitle" class="input" placeholder="例如：手动兑换奶茶 / 临时奖励补记">
      </label>
      <label>积分变化
        <input id="pointsDelta" class="input" type="number" step="1" placeholder="收入填正数，支出填负数">
      </label>
      <label>备注
        <textarea id="pointsNote" class="input" rows="3" placeholder="写清楚这笔积分为什么发生"></textarea>
      </label>
      <div class="sheet-actions">
        <button class="btn" id="pointsCancelBtn">取消</button>
        <button class="btn primary" id="pointsSaveBtn">保存</button>
      </div>
    </div>
  `, { height: '56vh' });

  root.querySelector('#pointsCancelBtn').addEventListener('click', close);
  root.querySelector('#pointsSaveBtn').addEventListener('click', () => {
    const title = root.querySelector('#pointsTitle').value.trim();
    const delta = Math.round(Number(root.querySelector('#pointsDelta').value) || 0);
    const note = root.querySelector('#pointsNote').value.trim();
    if (!title) {
      showToast('先写清楚这笔积分的标题');
      return;
    }
    if (!delta) {
      showToast('积分变化不能为 0');
      return;
    }
    recordPointsTransaction({
      delta,
      title,
      note,
      sourceType: 'manual_adjustment',
      bucket: delta >= 0 ? 'earn' : 'spend',
    });
    close();
    showToast(`已记账 ${formatDelta(delta)}`);
    onDone?.();
  });
}
