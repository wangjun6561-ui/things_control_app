const STORAGE_KEY = 'taskbox_data';

const DEFAULT_BOXES = [
  { name: '重要盒', color: 'important', icon: '⭐', sortOrder: 0, isDefault: true, description: '放这里的，都是不做会后悔的事。别拖了，一件一件来。' },
  { name: '放松盒', color: 'relax', icon: '☕', sortOrder: 1, isDefault: true, description: '累了就来这里抽一个，给自己一个正当的休息理由。' },
  { name: '奖励盒', color: 'reward', icon: '🎁', sortOrder: 2, isDefault: true, description: '完成了重要任务？来这里随机抽一个奖励犒劳自己吧。' },
  { name: '待办盒', color: 'misc', icon: '📦', sortOrder: 3, isDefault: true, description: '想到就记，统一处理，减少脑内占用。' },
  { name: '惩罚盒', color: 'punish', icon: '⚡', sortOrder: 4, isDefault: true, description: '没完成计划？随机抽一个惩罚，对自己狠一点才能进步。' },
  { name: '碎片学习盒', color: 'study', icon: '🧩', sortOrder: 5, isDefault: true, description: '碎片时间学习清单，想到就看。' },
  { name: '健康盒', color: 'health', icon: '💪', sortOrder: 6, isDefault: true, description: '每天一点点，练身体、稳心态。' },
];

const DEFAULT_TASKS = [
  { boxName: '放松盒', content: '听音乐两首' },
  { boxName: '放松盒', content: '冥想 5min' },
  { boxName: '放松盒', content: '靠墙站立' },
  { boxName: '放松盒', content: '洗袜子/衣服/扫地' },
  { boxName: '放松盒', content: '整理桌面' },
  { boxName: '放松盒', content: '离开屏幕望向远处' },
  { boxName: '放松盒', content: '散步 5min' },
  { boxName: '放松盒', content: '拉伸颈肩' },
  { boxName: '放松盒', content: '喝杯热饮' },
  { boxName: '放松盒', content: '随手涂鸦' },
  { boxName: '放松盒', content: '做几组深蹲' },
  { boxName: '放松盒', content: '写下三件感恩的事' },
  { boxName: '放松盒', content: '冷水洗脸' },
  { boxName: '放松盒', content: '做手部按摩' },
  { boxName: '放松盒', content: '渐进式肌肉放松' },
  { boxName: '放松盒', content: '读几页课外书' },
  { boxName: '放松盒', content: '4-7-8 呼吸练习' },
  { boxName: '放松盒', content: '闻喜欢的香薰' },
  { boxName: '放松盒', content: '自由书写 5min' },

  { boxName: '奖励盒', content: '高分牛肉火锅' },
  { boxName: '奖励盒', content: '高分自助餐' },
  { boxName: '奖励盒', content: '高分烧烤夜宵' },
  { boxName: '奖励盒', content: '去网红甜品店打卡' },
  { boxName: '奖励盒', content: '去电影院看一部期待已久的电影' },
  { boxName: '奖励盒', content: '买一件想了很久的东西100美元以内' },
  { boxName: '奖励盒', content: '买一本一直想看的书' },
  { boxName: '奖励盒', content: '去一个没去过的公园或景点' },
  { boxName: '奖励盒', content: '去咖啡馆坐一个下午' },
  { boxName: '奖励盒', content: '报一个一直想学的兴趣课' },
  { boxName: '奖励盒', content: '来一次说走就走的短途旅行-10h' },

  { boxName: '惩罚盒', content: '复盘 1k 字' },
  { boxName: '惩罚盒', content: '输出主题文章 2k 字' },
  { boxName: '惩罚盒', content: '手写笔记整理 30min' },
  { boxName: '惩罚盒', content: '背 50 个单词并默写' },
  { boxName: '惩罚盒', content: '读专业书籍 1 小时并做笔记' },
  { boxName: '惩罚盒', content: '整理电脑文件夹' },
  { boxName: '惩罚盒', content: '本周待办全部过一遍并更新' },
  { boxName: '惩罚盒', content: '做 50 个深蹲 + 20 个俯卧撑' },
  { boxName: '惩罚盒', content: '跑步或快走 30min' },
  { boxName: '惩罚盒', content: '戒手机 2 小时' },
  { boxName: '惩罚盒', content: '今日禁止刷短视频' },
  { boxName: '惩罚盒', content: '提前 1 小时起床' },
  { boxName: '惩罚盒', content: '冷水澡' },
  { boxName: '惩罚盒', content: '整理并归纳本周所有错误' },
  { boxName: '惩罚盒', content: '给自己录一段 5min 反思视频' },
  { boxName: '惩罚盒', content: '列出下周计划并细化到每天' },
  { boxName: '惩罚盒', content: '学一个新技能并输出笔记' },
  { boxName: '惩罚盒', content: '阅读并总结一篇英文文章' },
  { boxName: '惩罚盒', content: '断食一餐' },

  { boxName: '碎片学习盒', content: '生财有术中标' },
  { boxName: '碎片学习盒', content: '生财有术亦仁收藏夹' },
  { boxName: '碎片学习盒', content: '生财有术资源对接' },
  { boxName: '碎片学习盒', content: '硅谷王川推特' },
  { boxName: '碎片学习盒', content: '王川关注的人的推特' },
  { boxName: '碎片学习盒', content: '看涛哥问答' },
  { boxName: '碎片学习盒', content: '付费文章（微信）' },
  { boxName: '健康盒', content: '每天站桩 10 分钟（一开始可以 5 分钟）' },
  { boxName: '健康盒', content: '每天冥想 10 分钟（一开始可以 5 分钟）' },
  { boxName: '健康盒', content: '5楼以下通通走楼梯' },
];


let cloudSyncTimer = null;
const SOUND_CACHE = new Map();
const BOX_COLOR_POOL = ['important', 'relax', 'reward', 'misc', 'punish', 'study', 'health'];
const DEFAULT_PAVILION_URL = 'https://gist.githubusercontent.com/wangjun6561-ui/6a56c7352da690f8aeca47262361243b/raw/1f947c59ab7be5f873b92d66f71f3d941f7ea5e1/pavilion.json';
const LEGACY_TOWER_URL = 'https://gist.githubusercontent.com/wangjun6561-ui/6a56c7352da690f8aeca47262361243b/raw/1f947c59ab7be5f873b92d66f71f3d941f7ea5e1/tower.json';
const DEFAULT_TOWER_URL = 'https://gist.githubusercontent.com/wangjun6561-ui/6a56c7352da690f8aeca47262361243b/raw/8cf924c148ac25cfc443c685e204d75b29da69e1/tower.json';

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(data = {}) {
  return {
    boxes: (Array.isArray(data.boxes) ? data.boxes : []).map((b) => {
      const renamed = b.name === '杂事盒' ? '待办盒' : (b.name === '重要事项' ? '重要盒' : b.name);
      const orderMap = { '重要盒': 0, '放松盒': 1, '奖励盒': 2, '待办盒': 3, '惩罚盒': 4, '碎片学习盒': 5, '健康盒': 6 };
      return { ...b, name: renamed, sortOrder: orderMap[renamed] ?? b.sortOrder ?? 99, color: b.color || BOX_COLOR_POOL[orderMap[renamed] ?? 0] };
    }),
    tasks: (Array.isArray(data.tasks) ? data.tasks : []).map((t) => ({
      ...t,
      weight: t.weight ?? 1,
      pointsValue: t.pointsValue !== undefined && t.pointsValue !== null && Number.isFinite(Number(t.pointsValue)) ? Number(t.pointsValue) : null,
      progress: t.progress ?? (t.isCompleted ? 100 : 0),
      deleted: t.deleted ?? false,
      deletedAt: t.deletedAt ?? null,
      note: t.note ?? [t.reflection, t.review, t.summaryText].filter(Boolean).join('\n').trim(),
      syncKey: t.syncKey || `${t.createdAt || ''}::${t.content || ''}`,
      updatedAt: t.updatedAt || t.createdAt || new Date().toISOString()
    })),
    settings: {
      deepseekApiKey: data.settings?.deepseekApiKey || 'sk-ddabde5745eb401ea45777acf76b673c',
      themeMode: data.settings?.themeMode || 'system',
      soundEnabled: data.settings?.soundEnabled ?? true,
      cloudEnabled: data.settings?.cloudEnabled ?? false,
      cloudEndpoint: data.settings?.cloudEndpoint || 'v3/b/69d3d1bb856a68218904f116',
      cloudToken: data.settings?.cloudToken || '$2a$10$xCOfTmFVhdMLbv/wEL/UgeCFzBNO/He3sUcqV6OpwMJ.B/mmmxxaa',
      pavilionDataUrl: data.settings?.pavilionDataUrl || DEFAULT_PAVILION_URL,
      towerDataUrl: !data.settings?.towerDataUrl || data.settings?.towerDataUrl === LEGACY_TOWER_URL
        ? DEFAULT_TOWER_URL
        : data.settings.towerDataUrl,
      pointsDataUrl: data.settings?.pointsDataUrl || '',
      flomoWebhook: data.settings?.flomoWebhook || '',
      githubToken: data.settings?.githubToken || '',
    },
    meta: {
      updatedAt: data.meta?.updatedAt || new Date().toISOString(),
      lastDailyReset: data.meta?.lastDailyReset || '',
      lastSummaryExportAt: data.meta?.lastSummaryExportAt || null,
    },
  };
}

function seed() {
  const now = new Date().toISOString();
  const boxes = DEFAULT_BOXES.map((b, i) => ({ ...b, id: uid(), createdAt: now, sortOrder: i }));
  const boxMap = new Map(boxes.map((b) => [b.name, b.id]));
  const tasks = DEFAULT_TASKS.map((t, i) => ({
    id: uid(),
    boxId: boxMap.get(t.boxName),
    content: t.content,
    isCompleted: false,
    sortOrder: i,
    priority: 2,
    weight: 1,
    progress: 0,
    deleted: false,
    deletedAt: null,
    note: '',
    syncKey: `${now}::${t.content}`,
    dueDate: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  }));
  const initial = normalize({
    boxes,
    tasks,
    settings: { deepseekApiKey: 'sk-ddabde5745eb401ea45777acf76b673c', themeMode: 'system', soundEnabled: true, cloudEnabled: true, cloudEndpoint: 'v3/b/69d3d1bb856a68218904f116', cloudToken: '$2a$10$xCOfTmFVhdMLbv/wEL/UgeCFzBNO/He3sUcqV6OpwMJ.B/mmmxxaa', pointsDataUrl: '', flomoWebhook: '', githubToken: '' },
    meta: { updatedAt: now, lastDailyReset: '', lastSummaryExportAt: null },
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}



function dedupeByContentPerBox(data) {
  const map = new Map();
  data.tasks.forEach((t) => {
    const key = `${t.boxId}::${(t.content || '').trim()}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, t);
      return;
    }
    const chosen = prev.deleted && !t.deleted ? t : (!prev.deleted && t.deleted ? prev : (new Date(prev.updatedAt) >= new Date(t.updatedAt) ? prev : t));
    chosen.isCompleted = Boolean(prev.isCompleted || t.isCompleted || chosen.isCompleted);
    chosen.progress = Math.max(Number(prev.progress) || 0, Number(t.progress) || 0, Number(chosen.progress) || 0);
    map.set(key, chosen);
  });
  data.tasks = Array.from(map.values());
  return data;
}

function applyDailyTaskRefresh(data) {
  const today = new Date().toISOString().slice(0, 10);
  if (data.meta.lastDailyReset === today) return data;

  const targetBoxNames = new Set(['放松盒', '奖励盒', '惩罚盒']);
  const targetBoxIds = new Set(data.boxes.filter((b) => targetBoxNames.has(b.name)).map((b) => b.id));

  data.tasks = data.tasks.map((t) => (
    (targetBoxIds.has(t.boxId) && !t.deleted) ? { ...t, isCompleted: false, completedAt: null, progress: 0 } : t
  ));
  data.meta.lastDailyReset = today;
  return data;
}

function enforceUniqueBoxColors(data) {
  const used = new Set();
  const ordered = [...data.boxes].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  ordered.forEach((box, idx) => {
    if (!box.color || used.has(box.color)) {
      const replacement = BOX_COLOR_POOL.find((c) => !used.has(c)) || BOX_COLOR_POOL[idx % BOX_COLOR_POOL.length];
      box.color = replacement;
    }
    used.add(box.color);
  });
  return data;
}

export function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed();
  try {
    const normalized = normalize(JSON.parse(raw));
    const refreshed = enforceUniqueBoxColors(dedupeByContentPerBox(applyDailyTaskRefresh(normalized)));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
    return refreshed;
  } catch {
    return seed();
  }
}

export function saveData(data, { skipCloud = false } = {}) {
  const normalized = normalize(data);
  normalized.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  if (!skipCloud) scheduleCloudPush();
}

export function updateData(updater, options = {}) {
  const next = updater(structuredClone(getData()));
  saveData(next, options);
  return next;
}

export const getBoxes = () => getData().boxes.sort((a, b) => a.sortOrder - b.sortOrder);
export const getTasks = () => getData().tasks.filter((t) => !t.deleted);
export const getSettings = () => getData().settings;

export function getTasksByBox(boxId) {
  return getTasks()
    .filter((t) => t.boxId === boxId)
    .sort((a, b) => (Number(b.weight)||1) - (Number(a.weight)||1)
      || (Number(b.priority)||0) - (Number(a.priority)||0)
      || (Number(b.progress)||0) - (Number(a.progress)||0)
      || a.sortOrder - b.sortOrder
      || new Date(a.createdAt) - new Date(b.createdAt));
}

export function addTask(task) {
  let created = null;
  updateData((data) => {
    const maxOrder = Math.max(-1, ...data.tasks.filter((t) => t.boxId === task.boxId && !t.isCompleted).map((t) => t.sortOrder));
    created = {
      id: uid(),
      content: task.content,
      boxId: task.boxId,
      priority: task.priority ?? null,
      weight: task.weight ?? 1,
      pointsValue: task.pointsValue ?? null,
      progress: task.progress ?? 0,
      dueDate: task.dueDate ?? null,
      isCompleted: task.isCompleted ?? false,
      deleted: false,
      deletedAt: null,
      note: task.note ?? '',
      sortOrder: maxOrder + 1,
      completedAt: task.completedAt ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncKey: `${new Date().toISOString()}::${task.content}`,
    };
    data.tasks.push(created);
    return data;
  });
  return created;
}

function nextUniqueBoxColor(boxes) {
  const used = new Set(boxes.map((b) => b.color));
  const available = BOX_COLOR_POOL.find((c) => !used.has(c));
  if (available) return available;
  return BOX_COLOR_POOL[boxes.length % BOX_COLOR_POOL.length];
}

export async function addBox({ name, description = '' }) {
  const cleanName = (name || '').trim();
  if (!cleanName) throw new Error('box name required');

  let created = null;
  updateData((data) => {
    if (data.boxes.some((b) => b.name.trim() === cleanName)) {
      throw new Error('box exists');
    }
    created = {
      id: uid(),
      name: cleanName,
      description: description.trim(),
      color: nextUniqueBoxColor(data.boxes),
      icon: '📦',
      sortOrder: data.boxes.length,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    data.boxes.push(created);
    return data;
  });

  try {
    await pushDataToCloud({ force: true });
  } catch {
    // cloud push best-effort
  }
  return created;
}


export function restoreTask(task) {
  updateData((data) => {
    const existing = data.tasks.find((t) => t.id === task.id || t.syncKey === task.syncKey);
    if (existing) {
      Object.assign(existing, { ...task, deleted: false, deletedAt: null, updatedAt: new Date().toISOString() });
    } else {
      data.tasks.push({ ...task, deleted: false, deletedAt: null, updatedAt: new Date().toISOString() });
    }
    return data;
  });
}

export function updateTask(taskId, patch) {
  const cloudCriticalKeys = new Set(['content', 'boxId', 'priority', 'weight', 'pointsValue', 'progress', 'dueDate', 'isCompleted', 'deleted', 'deletedAt', 'sortOrder', 'completedAt']);
  const shouldCloudPush = Object.keys(patch || {}).some((k) => cloudCriticalKeys.has(k));
  let updated = null;
  updateData((data) => {
    const t = data.tasks.find((x) => x.id === taskId);
    if (t) {
      Object.assign(t, patch);
      if (Object.prototype.hasOwnProperty.call(patch, 'content')) {
        t.syncKey = `${t.createdAt}::${t.content}`;
      }
      t.updatedAt = new Date().toISOString();
      updated = { ...t };
    }
    return data;
  }, { skipCloud: !shouldCloudPush });
  return updated;
}

export function deleteTask(taskId) {
  updateData((data) => {
    const t = data.tasks.find((x) => x.id === taskId);
    if (t) {
      t.deleted = true;
      t.deletedAt = new Date().toISOString();
      t.updatedAt = new Date().toISOString();
    }
    return data;
  });
}

export function reorderTasks(boxId, orderedTaskIds) {
  updateData((data) => {
    const indexMap = new Map(orderedTaskIds.map((id, i) => [id, i]));
    data.tasks.forEach((t) => {
      if (t.boxId === boxId && !t.isCompleted && indexMap.has(t.id)) t.sortOrder = indexMap.get(t.id);
    });
    return data;
  });
}

export function updateBox(boxId, patch) {
  updateData((data) => {
    const box = data.boxes.find((b) => b.id === boxId);
    if (box) Object.assign(box, patch);
    return data;
  });
}

export function setSettings(patch) {
  updateData((data) => {
    data.settings = { ...data.settings, ...patch };
    return data;
  });
}

export function exportData() {
  const backup = {
    ...getData(),
    __pointsCache: (() => {
      const raw = localStorage.getItem('taskbox_points_cache');
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'taskbox-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importData(file) {
  const text = await file.text();
  const imported = JSON.parse(text);
  const parsed = normalize(imported);
  saveData(parsed);
  if (imported?.__pointsCache) {
    localStorage.setItem('taskbox_points_cache', JSON.stringify(imported.__pointsCache));
  }
}

export function exportDailySummary() {
  const data = getData();
  const targetNames = new Set(['重要盒', '待办盒']);
  const boxMap = new Map(data.boxes.map((b) => [b.id, b.name]));
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const since = data.meta.lastSummaryExportAt ? new Date(data.meta.lastSummaryExportAt) : null;

  const shouldInclude = (t) => {
    if (t.deleted || !targetNames.has(boxMap.get(t.boxId))) return false;
    const completedAt = t.completedAt ? new Date(t.completedAt) : null;
    const updatedAt = t.updatedAt ? new Date(t.updatedAt) : null;
    if (!since) return t.isCompleted || ((Number(t.progress) || 0) > 0);
    if (t.isCompleted && completedAt && completedAt > since) return true;
    if (!t.isCompleted && (Number(t.progress) || 0) > 0 && updatedAt && updatedAt > since) return true;
    return false;
  };

  const rows = data.tasks.filter(shouldInclude);

  const lines = [
    `# ${today} 每日汇总`,
    '',
    `统计区间：${data.meta.lastSummaryExportAt || '首次导出'} -> ${now}`,
    '',
    '## 重要盒 & 待办盒（新增完成/进行中）',
    ''
  ];

  if (!rows.length) lines.push('- 本时段无新增内容');
  rows.forEach((t) => {
    const mark = t.isCompleted ? '[x]' : `[~ ${Math.max(0, Math.min(100, Number(t.progress) || 0))}%]`;
    lines.push(`- ${mark} (${boxMap.get(t.boxId)}) ${t.content}`);
    if (t.note) lines.push(`  - 备注：${t.note}`);
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${today}.md`;
  a.click();
  URL.revokeObjectURL(a.href);

  updateData((next) => {
    next.meta.lastSummaryExportAt = now;
    return next;
  });
}

export function playSound(name) {
  if (!getSettings().soundEnabled) return;
  const src = `assets/sounds/${name}.mp3`;
  if (!SOUND_CACHE.has(src)) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    SOUND_CACHE.set(src, audio);
  }
  const base = SOUND_CACHE.get(src);
  const s = base.cloneNode(true);
  s.play().catch(() => {});
}

function scheduleCloudPush() {
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    pushDataToCloud().catch(() => {});
  }, 700);
}


function isJsonBinEndpoint(url) {
  return /api\.jsonbin\.io\/v3\/b\//.test(url || '');
}

function normalizeToken(token = '') {
  return token.trim().replace(/^\[|\]$/g, '');
}


function resolveCloudEndpoint(rawEndpoint, { forRead = false } = {}) {
  const value = (rawEndpoint || '').trim();
  if (!value) return '';

  let endpoint = value;
  if (/^[a-f0-9]{24}$/i.test(endpoint)) {
    endpoint = `https://api.jsonbin.io/v3/b/${endpoint}`;
  } else if (endpoint.startsWith('/v3/')) {
    endpoint = `https://api.jsonbin.io${endpoint}`;
  } else if (endpoint.startsWith('v3/')) {
    endpoint = `https://api.jsonbin.io/${endpoint}`;
  }

  if (forRead && isJsonBinEndpoint(endpoint) && !/\/latest$/i.test(endpoint) && !/\/\d+$/i.test(endpoint)) {
    endpoint = `${endpoint.replace(/\/$/, '')}/latest`;
  }

  return endpoint;
}

function buildCloudHeaders(endpoint, token, includeJson = true) {
  const cleanToken = normalizeToken(token);
  const headers = includeJson ? { 'Content-Type': 'application/json' } : {};

  if (!cleanToken) return headers;

  if (isJsonBinEndpoint(endpoint)) {
    headers['X-Master-Key'] = cleanToken;
    headers['X-Access-Key'] = cleanToken;
  } else {
    headers.Authorization = `Bearer ${cleanToken}`;
  }

  return headers;
}

export async function pushDataToCloud(options = {}) {
  const { force = false } = options;
  const data = getData();
  const { cloudEnabled, cloudEndpoint, cloudToken } = data.settings;
  const endpoint = resolveCloudEndpoint(cloudEndpoint, { forRead: false });
  if (!endpoint) return false;
  if (!force && !cloudEnabled) return false;

  await fetch(endpoint, {
    method: 'PUT',
    headers: buildCloudHeaders(endpoint, cloudToken, true),
    body: JSON.stringify(data),
  });

  return true;
}


function dedupeTasks(tasks) {
  const map = new Map();

  tasks.forEach((t) => {
    const key = t.syncKey || [t.createdAt || '', t.content?.trim()].join('::');
    const current = map.get(key);

    if (!current) {
      map.set(key, { ...t });
      return;
    }

    current.deleted = Boolean(current.deleted || t.deleted);
    current.deletedAt = current.deletedAt || t.deletedAt || null;
    current.isCompleted = Boolean(current.isCompleted || t.isCompleted);
    current.completedAt = current.completedAt || t.completedAt || null;
    current.weight = Math.max(Number(current.weight) || 1, Number(t.weight) || 1);
    current.progress = Math.max(Number(current.progress) || 0, Number(t.progress) || 0);
    current.sortOrder = Math.min(Number(current.sortOrder) || 0, Number(t.sortOrder) || 0);
    map.set(key, current);
  });

  return Array.from(map.values());
}

function mergeData(local, cloud) {
  const merged = normalize({
    ...local,
    boxes: [...local.boxes, ...cloud.boxes],
    tasks: [...local.tasks, ...cloud.tasks],
    meta: { updatedAt: new Date().toISOString() },
  });

  const chosenByName = new Map();
  const idRemap = new Map();
  merged.boxes.forEach((b) => {
    if (!chosenByName.has(b.name)) chosenByName.set(b.name, b);
    idRemap.set(b.id, chosenByName.get(b.name).id);
  });

  merged.boxes = Array.from(chosenByName.values()).map((b, i) => ({ ...b, sortOrder: i }));
  const validBoxIds = new Set(merged.boxes.map((b) => b.id));

  merged.tasks = dedupeTasks(
    merged.tasks
      .map((t) => ({ ...t, boxId: idRemap.get(t.boxId) || t.boxId }))
      .filter((t) => validBoxIds.has(t.boxId))
  );

  return merged;
}

export async function pullDataFromCloud(options = {}) {
  const { force = false } = options;
  const local = getData();
  const { cloudEnabled, cloudEndpoint, cloudToken } = local.settings;
  const endpoint = resolveCloudEndpoint(cloudEndpoint, { forRead: true });
  if (!endpoint) return false;
  if (!force && !cloudEnabled) return false;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: buildCloudHeaders(endpoint, cloudToken, false),
  });
  if (!response.ok) throw new Error('cloud pull failed');

  const payload = await response.json();
  const cloudRaw = isJsonBinEndpoint(endpoint) ? (payload.record || {}) : payload;
  const cloudData = normalize(cloudRaw);
  const merged = mergeData(local, cloudData);
  merged.settings = { ...merged.settings, deepseekApiKey: local.settings.deepseekApiKey };
  saveData(merged, { skipCloud: true });
  return 'merged';
}
