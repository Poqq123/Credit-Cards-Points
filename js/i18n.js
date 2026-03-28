const STORAGE_KEY = 'ccp-language';
const DEFAULT_LANGUAGE = 'zh-CN';

const TRANSLATIONS = {
  'zh-CN': {
    graphDocTitle: '信用卡转点二分图',
    graphMetaDescription: '美国信用卡积分转点航空公司与酒店的交互式二分图',
    graphHeaderTitle: '💳 信用卡转点伙伴图谱',
    graphHeaderSubtitle:
      'by <a href="https://github.com/Poqq123" style="color:#a78bfa">Poqq123</a> · 2026.3<br><a href="redemption-value.html">💎 兑换价值</a> · <a href="references.html">📚 数据来源</a> · <a href="https://github.com/1suponatime/credit-card-transfer-graph/issues/new">🐛 报错</a>',
    modeAirlines: '✈️ 航空公司',
    modeHotels: '🏨 酒店',
    controlsHint:
      '<kbd>悬停</kbd> 高亮 · <kbd>点击</kbd> 锁定 · <kbd>滚轮</kbd> 缩放 · <kbd>拖拽</kbd> 平移',
    overviewTitle: '📊 概览',
    cardPrograms: '积分计划',
    transferRelationships: '转点关系',
    target: '目标',
    group: '分组',
    redemptionDocTitle: '积分兑换价值分析',
    redemptionMetaDescription:
      '交互式信用卡积分兑换价值分析，帮你找出最划算的转点方向',
    backToGraph: '← 返回转点二分图',
    redemptionHeaderTitle: '💎 积分兑换价值分析',
    redemptionHeaderSubtitle: '选择目标航司或酒店，查看哪个积分计划转点最划算',
    portalSectionTitle: '📊 Portal 固定兑换值 & 有效回报率',
    pickerSectionTitle: '🎯 选择目标 — 找出最佳转点路径',
    footerGraphLink: '转点二分图',
    footerRedemptionLink: '兑换价值分析',
    footerReferencesLink: '📚 数据来源',
    footerIssuesLink: '🐛 报错',
    portalProgram: '积分计划',
    annualFee: '年费',
    portalFlights: 'Portal 机票',
    portalHotels: 'Portal 酒店',
    portalEarnRate: 'Portal Earn Rate',
    directReturn: '直连有效回报率',
    portalReturn: 'Portal 有效回报率',
    earnSummary: '{flights} 机票 / {hotels} 酒店',
    pickerControlsTitle: '筛选与排序',
    destinationSearchLabel: '搜索目标',
    destinationSearchPlaceholder: '输入代码、名称或分组',
    destinationSortLabel: '目标排序',
    destinationSortGroup: '按分组',
    destinationSortValue: '按估值',
    destinationSortAz: '按字母',
    cardSortLabel: '结果排序',
    cardSortValue: '按价值',
    cardSortFee: '按年费',
    cardSortRatio: '按比例',
    destinationSummary: '显示 {count} / {total} 个目标',
    noDestinationMatches: '没有匹配的目标，请换个关键词试试',
    pickPrompt: '👆 选择一个航空公司或酒店，查看最佳转点方案',
    noValuation: '当前目标暂无估值数据',
    resultSubtitle: '{group} · 里程/积分均价 {avgCpp}¢/pt · {count} 个积分计划可转入',
    noPartners: '没有直接转点伙伴',
    recommended: '⭐ 推荐',
    transferRatio: '转点比例',
    effectiveCpp: '有效 CPP',
    value100k: '100k 积分价值',
    valueCalc: '100k → {points}k {unit} × {avgCpp}¢ = ${value}',
    unitMiles: 'miles',
    unitPoints: 'points',
    tooltipCardSub: '转点至 {count} 个{mode}',
    tooltipDestSub: '{group} · {count} 个积分计划可转入',
    airlinesNoun: '航空公司',
    hotelsNoun: '酒店',
    referencesDocTitle: '数据来源',
    referencesMetaDescription: '本项目中使用的转点比例、点数估值和 Portal 兑换值来源',
    referencesBackToGraph: '← 返回转点二分图',
    referencesHeaderTitle: '📚 数据来源',
    referencesHeaderSubtitle: '本项目中所有转点比例、CPP 估值、Portal 兑换值的数据来源',
  },
  en: {
    graphDocTitle: 'Credit Card Transfer Partners',
    graphMetaDescription:
      'Interactive bipartite graph of US credit card transfer partners to airlines and hotels',
    graphHeaderTitle: '💳 Credit Card Transfer Partners',
    graphHeaderSubtitle:
      'by <a href="https://github.com/Poqq123" style="color:#a78bfa">Poqq123</a> · March 2026<br><a href="redemption-value.html">💎 Redemption Value</a> · <a href="references.html">📚 References</a> · <a href="https://github.com/1suponatime/credit-card-transfer-graph/issues/new">🐛 Report Issue</a>',
    modeAirlines: '✈️ Airlines',
    modeHotels: '🏨 Hotels',
    controlsHint:
      '<kbd>Hover</kbd> highlight · <kbd>Click</kbd> lock · <kbd>Wheel</kbd> zoom · <kbd>Drag</kbd> pan',
    overviewTitle: '📊 Overview',
    cardPrograms: 'Card Programs',
    transferRelationships: 'Transfer Links',
    target: 'Target',
    group: 'Group',
    redemptionDocTitle: 'Points Redemption Value',
    redemptionMetaDescription:
      'Interactive credit card points redemption value analysis to help you find the best transfer option',
    backToGraph: '← Back to transfer graph',
    redemptionHeaderTitle: '💎 Points Redemption Value',
    redemptionHeaderSubtitle:
      'Choose an airline or hotel program to see which card points transfer gives the best value',
    portalSectionTitle: '📊 Portal CPP & Effective Return',
    pickerSectionTitle: '🎯 Pick a Target — Find the Best Transfer Path',
    footerGraphLink: 'Transfer graph',
    footerRedemptionLink: 'Redemption value',
    footerReferencesLink: '📚 References',
    footerIssuesLink: '🐛 Report issue',
    portalProgram: 'Program',
    annualFee: 'Annual Fee',
    portalFlights: 'Portal Flights',
    portalHotels: 'Portal Hotels',
    portalEarnRate: 'Portal Earn Rate',
    directReturn: 'Direct Transfer Return',
    portalReturn: 'Portal Return',
    earnSummary: '{flights} flights / {hotels} hotels',
    pickerControlsTitle: 'Filter and Sort',
    destinationSearchLabel: 'Search targets',
    destinationSearchPlaceholder: 'Enter a code, name, or group',
    destinationSortLabel: 'Target sort',
    destinationSortGroup: 'Group',
    destinationSortValue: 'Value',
    destinationSortAz: 'A-Z',
    cardSortLabel: 'Result sort',
    cardSortValue: 'Value',
    cardSortFee: 'Annual fee',
    cardSortRatio: 'Transfer ratio',
    destinationSummary: 'Showing {count} of {total} targets',
    noDestinationMatches: 'No targets match this search yet',
    pickPrompt: '👆 Pick an airline or hotel to compare the best transfer options',
    noValuation: 'No valuation data is available for this target yet',
    resultSubtitle: '{group} · avg value {avgCpp}¢/pt · {count} transferable programs',
    noPartners: 'No direct transfer partners',
    recommended: '⭐ Best',
    transferRatio: 'Transfer Ratio',
    effectiveCpp: 'Effective CPP',
    value100k: 'Value of 100k points',
    valueCalc: '100k → {points}k {unit} × {avgCpp}¢ = ${value}',
    unitMiles: 'miles',
    unitPoints: 'points',
    tooltipCardSub: 'Transfers to {count} {mode}',
    tooltipDestSub: '{group} · {count} transferable programs',
    airlinesNoun: 'airlines',
    hotelsNoun: 'hotels',
    referencesDocTitle: 'References',
    referencesMetaDescription:
      'Sources for transfer ratios, point valuations, and portal redemption values used in this project',
    referencesBackToGraph: '← Back to transfer graph',
    referencesHeaderTitle: '📚 References',
    referencesHeaderSubtitle:
      'Sources for transfer ratios, CPP valuations, and portal redemption values used throughout this project',
  },
};

let currentLanguage = normalizeLanguage(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE);
const listeners = new Set();

function normalizeLanguage(language) {
  if (!language) {
    return null;
  }

  const normalized = String(language).trim().toLowerCase();
  if (normalized === 'en' || normalized.startsWith('en-')) {
    return 'en';
  }
  if (normalized === 'zh-cn' || normalized.startsWith('zh')) {
    return 'zh-CN';
  }

  return null;
}

function getBrowserLanguage() {
  const preferredLanguages = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const language of preferredLanguages) {
    const normalized = normalizeLanguage(language);
    if (normalized) {
      return normalized;
    }
  }

  return DEFAULT_LANGUAGE;
}

function getUrlLanguage() {
  const params = new URLSearchParams(window.location.search);
  return normalizeLanguage(params.get('lang'));
}

function resolveInitialLanguage() {
  return (
    getUrlLanguage() ||
    normalizeLanguage(localStorage.getItem(STORAGE_KEY)) ||
    getBrowserLanguage() ||
    DEFAULT_LANGUAGE
  );
}

function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));
}

function syncDocumentLanguage() {
  document.documentElement.lang = currentLanguage;
}

function setParamsOnUrl(url, updates = {}) {
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
      return;
    }

    url.searchParams.set(key, String(value));
  });
}

currentLanguage = resolveInitialLanguage();

export function getLanguage() {
  return currentLanguage;
}

export function t(key, params = {}) {
  const dictionary = TRANSLATIONS[currentLanguage] ?? TRANSLATIONS[DEFAULT_LANGUAGE];
  const fallbackDictionary = TRANSLATIONS[DEFAULT_LANGUAGE];
  const template = dictionary[key] ?? fallbackDictionary[key] ?? key;
  return interpolate(template, params);
}

export function setLanguage(language) {
  const nextLanguage = normalizeLanguage(language) || DEFAULT_LANGUAGE;
  if (nextLanguage === currentLanguage) {
    return;
  }

  currentLanguage = nextLanguage;
  localStorage.setItem(STORAGE_KEY, currentLanguage);
  syncDocumentLanguage();
  updateUrlParams({ lang: currentLanguage });
  listeners.forEach((listener) => listener(currentLanguage));
}

export function onLanguageChange(listener, { immediate = true } = {}) {
  listeners.add(listener);
  if (immediate) {
    listener(currentLanguage);
  }

  return () => listeners.delete(listener);
}

export function bindLanguageToggle(root = document) {
  const buttons = [...root.querySelectorAll('[data-language-option]')];

  const updateButtons = (language) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.languageOption === language;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.languageOption);
    });
  });

  updateButtons(currentLanguage);
  return onLanguageChange(updateButtons, { immediate: false });
}

export function updateUrlParams(updates, { replace = true } = {}) {
  const url = new URL(window.location.href);
  setParamsOnUrl(url, updates);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method](window.history.state, '', nextUrl);
}

export function buildPageUrl(path, params = {}) {
  const url = new URL(path, window.location.href);
  setParamsOnUrl(url, { lang: currentLanguage, ...params });
  return `${url.pathname}${url.search}${url.hash}`;
}

export function syncLocalizedLinks(root = document, paramsByPath = {}) {
  root.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    if (/^https?:\/\//i.test(href)) {
      return;
    }

    const target = new URL(href, window.location.href);
    const isSameOrigin = target.origin === window.location.origin;
    const isHtmlPage = target.pathname.endsWith('.html') || target.pathname === window.location.pathname;

    if (!isSameOrigin || !isHtmlPage) {
      return;
    }

    const pathKey = target.pathname.split('/').pop() || '';
    link.setAttribute('href', buildPageUrl(target.pathname + target.hash, paramsByPath[pathKey] ?? {}));
  });
}

export function setDocumentMeta({ title, description }) {
  if (title) {
    document.title = title;
  }

  if (description) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', description);
    }
  }
}

syncDocumentLanguage();
