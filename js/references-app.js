import {
  bindLanguageToggle,
  buildPageUrl,
  getLanguage,
  onLanguageChange,
  setDocumentMeta,
  syncLocalizedLinks,
  t,
  updateUrlParams,
} from './i18n.js';

const root = document.getElementById('references-app');
const backLink = document.getElementById('back-link');

const text = (value, language) =>
  typeof value === 'string' ? value : value[language] ?? value.en ?? value['zh-CN'] ?? '';

const copy = {
  coreHeading: { 'zh-CN': '📋 核心数据源', en: '📋 Core Sources' },
  issuerHeading: { 'zh-CN': '🏦 官方页面 — 各银行/发卡行', en: '🏦 Official Issuer Pages' },
  valuationHeading: { 'zh-CN': '💰 CPP 估值来源', en: '💰 CPP Valuation Sources' },
  quickRefHeading: { 'zh-CN': '📊 关键转点比例速查', en: '📊 Key Transfer Ratio Quick Reference' },
  updatesHeading: { 'zh-CN': '📝 更新日志', en: '📝 Update Log' },
  tableHeaders: {
    'zh-CN': ['积分计划', '目标', '比例', '来源'],
    en: ['Program', 'Target', 'Ratio', 'Source'],
  },
  quickRefNote: {
    'zh-CN':
      '未在此表中列出的均为 <strong>1:1</strong> 比例，来源: <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> US Credit Card Guide',
    en:
      'Any ratio not listed above is <strong>1:1</strong>. Source: <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> US Credit Card Guide',
  },
  footer: {
    'zh-CN':
      'by <a href="https://github.com/1suponatime">1suponatime</a> · <a href="index.html">转点二分图</a> · <a href="redemption-value.html">兑换价值分析</a> · <a href="https://github.com/1suponatime/credit-card-transfer-graph/issues">🐛 报错 / 提交 Issue</a>',
    en:
      'by <a href="https://github.com/1suponatime">1suponatime</a> · <a href="index.html">Transfer graph</a> · <a href="redemption-value.html">Redemption value</a> · <a href="https://github.com/1suponatime/credit-card-transfer-graph/issues">🐛 Report issue</a>',
  },
};

const coreSources = [
  {
    number: 1,
    title: {
      'zh-CN': 'US Credit Card Guide — 积分点数之翼 (Wings of the Points)',
      en: 'US Credit Card Guide — Wings of the Points',
    },
    url: 'https://www.uscreditcardguide.com/wings-of-the-points/',
    displayUrl: 'uscreditcardguide.com/wings-of-the-points/',
    note: {
      'zh-CN': '更新至 2026.3 · 本项目的主要数据来源，涵盖所有信用卡积分转点航空/酒店比例',
      en: 'Updated through March 2026. Primary source for airline and hotel transfer ratios across all card programs in this project.',
    },
    tags: [
      { label: 'UR', color: '#3b82f6' },
      { label: 'MR', color: '#10b981' },
      { label: 'TYP', color: '#6366f1' },
      { label: 'C1', color: '#ef4444' },
      { label: 'Bilt', color: '#f59e0b' },
      { label: 'Marriott', color: '#ec4899' },
    ],
  },
  {
    number: 2,
    title: {
      'zh-CN': 'US Credit Card Guide — 转点优惠汇总',
      en: 'US Credit Card Guide — Transfer Bonus Tracker',
    },
    url: 'https://www.uscreditcardguide.com/transfer-bonus/',
    displayUrl: 'uscreditcardguide.com/transfer-bonus/',
    note: {
      'zh-CN': '追踪所有转点 bonus 活动（如 TYP→VS 30% bonus）',
      en: 'Tracks transfer bonus promotions such as TYP → VS with a 30% bonus.',
    },
  },
];

const issuerSources = [
  {
    number: 3,
    title:
      '<span class="card-color" style="background:#3b82f6"></span>Chase — Ultimate Rewards Transfer Partners',
    url: 'https://ultimaterewardspoints.chase.com/transfer-partners',
    displayUrl: 'ultimaterewardspoints.chase.com/transfer-partners',
    note: {
      'zh-CN': '官方转点页面 · 航空: AC, BA, AF, IB, SQ, UA, VS, B6, WN, BR, EK · 酒店: Hyatt, IHG, Marriott, Wyndham',
      en: 'Official transfer page. Airlines: AC, BA, AF, IB, SQ, UA, VS, B6, WN, BR, EK. Hotels: Hyatt, IHG, Marriott, Wyndham.',
    },
  },
  {
    number: 4,
    title:
      '<span class="card-color" style="background:#10b981"></span>Amex — Membership Rewards Transfer Partners',
    url: 'https://global.americanexpress.com/rewards/transfer',
    displayUrl: 'global.americanexpress.com/rewards/transfer',
    note: {
      'zh-CN': '官方转点页面 · 需登录后查看 · 航空: AC, NH(1:0.5), AV, BA, CX(1:0.8), DL, EK, EY, AF, HA, IB, SQ, VS, QF · 酒店: Hilton(1:2), Marriott, Choice',
      en: 'Official transfer page. Requires sign-in. Airlines: AC, NH (1:0.5), AV, BA, CX (1:0.8), DL, EK, EY, AF, HA, IB, SQ, VS, QF. Hotels: Hilton (1:2), Marriott, Choice.',
    },
  },
  {
    number: 5,
    title:
      '<span class="card-color" style="background:#6366f1"></span>Citi — ThankYou Rewards Transfer Partners',
    url: 'https://www.thankyou.com/redeem/transfer-partners',
    displayUrl: 'thankyou.com/redeem/transfer-partners',
    note: {
      'zh-CN': '官方转点页面 · 航空: AC, AV, CX, EK, EY, BR, AF, B6, MH, QF, QR, SQ, TK, VS · 酒店: Wyndham, Choice, Accor',
      en: 'Official transfer page. Airlines: AC, AV, CX, EK, EY, BR, AF, B6, MH, QF, QR, SQ, TK, VS. Hotels: Wyndham, Choice, Accor.',
    },
  },
  {
    number: 6,
    title:
      '<span class="card-color" style="background:#ef4444"></span>Capital One — Miles Transfer Partners',
    url: 'https://www.capitalone.com/credit-cards/benefits/transfer-miles/',
    displayUrl: 'capitalone.com/credit-cards/benefits/transfer-miles/',
    note: {
      'zh-CN': '官方转点页面 · 航空: AC, AV, BA, CX, EK, EY, BR, AF, IB, JL(1:0.75), QR, SQ, TK, VS · 酒店: Wyndham, Choice, Accor',
      en: 'Official transfer page. Airlines: AC, AV, BA, CX, EK, EY, BR, AF, IB, JL (1:0.75), QR, SQ, TK, VS. Hotels: Wyndham, Choice, Accor.',
    },
  },
  {
    number: 7,
    title:
      '<span class="card-color" style="background:#f59e0b"></span>Bilt — Rewards Transfer Partners',
    url: 'https://www.biltrewards.com/transfer-partners',
    displayUrl: 'biltrewards.com/transfer-partners',
    note: {
      'zh-CN': '官方转点页面 · 航空: AA, AC, AF, BA, CX, EK, IB, TK, UA, VS, QR · 酒店: Hyatt, Hilton, IHG, Marriott, Accor',
      en: 'Official transfer page. Airlines: AA, AC, AF, BA, CX, EK, IB, TK, UA, VS, QR. Hotels: Hyatt, Hilton, IHG, Marriott, Accor.',
    },
  },
  {
    number: 8,
    title:
      '<span class="card-color" style="background:#ec4899"></span>Marriott — Bonvoy Points-to-Miles',
    url: 'https://www.marriott.com/loyalty/redeem/travel/airlines.mi',
    displayUrl: 'marriott.com/loyalty/redeem/travel/airlines.mi',
    note: {
      'zh-CN': '官方转航司页面 · 3:1 基础比例 · 60k 转赠送额外 5k miles (= 3:1.25)',
      en: 'Official airline transfer page. Base ratio is 3:1, with an extra 5k miles bonus on 60k transfers (= 3:1.25).',
    },
  },
];

const valuationSources = [
  {
    number: 9,
    title: 'The Points Guy — Monthly Points Valuations',
    url: 'https://thepointsguy.com/guide/monthly-valuations/',
    displayUrl: 'thepointsguy.com/guide/monthly-valuations/',
    note: {
      'zh-CN': 'TPG 每月更新各积分/里程估值 · Bilt 2.2¢、UR 2.0¢、MR 2.0¢',
      en: 'Monthly points and miles valuations from TPG, including Bilt at 2.2 cents, UR at 2.0 cents, and MR at 2.0 cents.',
    },
  },
  {
    number: 10,
    title: 'NerdWallet — Points & Miles Valuations',
    url: 'https://www.nerdwallet.com/article/travel/airline-miles-and-hotel-points-valuations',
    displayUrl: 'nerdwallet.com/article/travel/airline-miles-and-hotel-points-valuations',
    note: {
      'zh-CN': 'NerdWallet 独立估值 · 通常比 TPG 保守',
      en: 'Independent NerdWallet valuations, usually a bit more conservative than TPG.',
    },
  },
  {
    number: 11,
    title: 'Frequent Miler — Reasonable Redemption Values',
    url: 'https://frequentmiler.com/reasonable-redemption-values/',
    displayUrl: 'frequentmiler.com/reasonable-redemption-values/',
    note: {
      'zh-CN': '基于实际兑换案例的中位数估值 · 数据方法论最透明',
      en: 'Median-value estimates derived from real redemption examples, with one of the clearest published methodologies.',
    },
  },
];

const quickRefRows = [
  {
    program: '<span class="card-color" style="background:#10b981"></span>Amex MR',
    target: { 'zh-CN': '全日空 (NH)', en: 'ANA (NH)' },
    ratio: '1 : 0.5',
    source: '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
  },
  {
    program: '<span class="card-color" style="background:#10b981"></span>Amex MR',
    target: { 'zh-CN': '国泰 (CX)', en: 'Cathay (CX)' },
    ratio: '1 : 0.8',
    source: {
      'zh-CN':
        '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> 2026.3 更新',
      en:
        '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> updated March 2026',
    },
  },
  {
    program: '<span class="card-color" style="background:#10b981"></span>Amex MR',
    target: 'Hilton (HH)',
    ratio: '1 : 2',
    source: '<a href="https://global.americanexpress.com/rewards/transfer" style="color:#60a5fa">[4]</a>',
  },
  {
    program: '<span class="card-color" style="background:#10b981"></span>Amex MR',
    target: 'JetBlue (B6)',
    ratio: '1 : 0.8',
    source: '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
  },
  {
    program: '<span class="card-color" style="background:#ef4444"></span>Capital One',
    target: 'JAL (JL)',
    ratio: '1 : 0.75',
    source: {
      'zh-CN':
        '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> 2025.9 新增',
      en:
        '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> added September 2025',
    },
  },
  {
    program: '<span class="card-color" style="background:#ec4899"></span>Marriott',
    target: { 'zh-CN': '全部航司', en: 'All airlines' },
    ratio: '3 : 1 (60k→1.25)',
    source: '<a href="https://www.marriott.com/loyalty/redeem/travel/airlines.mi" style="color:#60a5fa">[8]</a>',
  },
  {
    program: '<span class="card-color" style="background:#ec4899"></span>Marriott',
    target: 'United (UA)',
    ratio: '3 : 1.1',
    source: {
      'zh-CN':
        '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> 比例略低',
      en:
        '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a> slightly lower than the standard Marriott ratio',
    },
  },
  {
    program: '<span class="card-color" style="background:#f59e0b"></span>Bilt',
    target: 'Marriott (MB)',
    ratio: '1:1 + 5k/20k',
    source: '<a href="https://www.biltrewards.com/transfer-partners" style="color:#60a5fa">[7]</a>',
  },
  {
    program: '<span class="card-color" style="background:#6366f1"></span>Citi TYP',
    target: 'Accor (AL)',
    ratio: '1 : 0.5',
    source: '<a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
  },
  {
    program: '<span class="card-color" style="background:#f59e0b"></span>Bilt',
    target: 'Accor (AL)',
    ratio: '1 : 0.67',
    source: '<a href="https://www.biltrewards.com/transfer-partners" style="color:#60a5fa">[7]</a>',
  },
];

const updates = [
  {
    date: '2026.3',
    content: {
      'zh-CN':
        'Amex MR → CX 比例从 1:1 调整为 1:0.8 <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
      en:
        'Amex MR → CX ratio changed from 1:1 to 1:0.8 <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
    },
  },
  {
    date: '2026.2',
    content: {
      'zh-CN': 'Chase UR 新增 Wyndham 为转点伙伴 (1:1)',
      en: 'Chase UR added Wyndham as a transfer partner at 1:1.',
    },
  },
  {
    date: '2026.1',
    content: {
      'zh-CN':
        'Citi TYP 移除 AeroMexico 作为转点伙伴 <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
      en:
        'Citi TYP removed AeroMexico as a transfer partner <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
    },
  },
  {
    date: '2025.10',
    content: {
      'zh-CN': 'Chase CSR 改版: Portal 兑换从固定 1.5cpp 改为浮动 Points Boost',
      en: 'Chase CSR changed portal redemption from a fixed 1.5 cpp to a variable Points Boost model.',
    },
  },
  {
    date: '2025.9',
    content: {
      'zh-CN':
        'Capital One 新增 JL (1:0.75) 和 QR (1:1) 转点伙伴 <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
      en:
        'Capital One added JL (1:0.75) and QR (1:1) as transfer partners <a href="https://www.uscreditcardguide.com/wings-of-the-points/" style="color:#60a5fa">[1]</a>',
    },
  },
];

function renderReferenceSection(items, language) {
  return items
    .map((item) => {
      const tags = item.tags
        ? `<div class="ref-tags">${item.tags
            .map(
              (tag) =>
                `<span class="ref-tag"><span class="card-color" style="background:${tag.color}"></span>${tag.label}</span>`,
            )
            .join('')}</div>`
        : '';

      return `<div class="ref-item">
        <div class="ref-num">${item.number}</div>
        <div class="ref-content">
          <div class="ref-title">${text(item.title, language)}</div>
          <div class="ref-url"><a href="${item.url}" target="_blank">${item.displayUrl}</a></div>
          <div class="ref-note">${text(item.note, language)}</div>
          ${tags}
        </div>
      </div>`;
    })
    .join('');
}

function renderQuickRefTable(language) {
  const headers = copy.tableHeaders[language];
  return `<table>
    <thead>
      <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${quickRefRows
        .map(
          (row) => `<tr>
            <td>${row.program}</td>
            <td>${text(row.target, language)}</td>
            <td>${row.ratio}</td>
            <td>${text(row.source, language)}</td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>
  <p style="font-size:11px;color:var(--dim);margin-top:8px">${text(copy.quickRefNote, language)}</p>`;
}

function renderUpdates(language) {
  return `<ul class="update-log">
    ${updates
      .map(
        (item) =>
          `<li><span class="date">${item.date}</span> — ${text(item.content, language)}</li>`,
      )
      .join('')}
  </ul>`;
}

function render(language) {
  setDocumentMeta({
    title: t('referencesDocTitle'),
    description: t('referencesMetaDescription'),
  });

  updateUrlParams({ lang: language });
  backLink.setAttribute('href', buildPageUrl('index.html'));
  backLink.textContent = t('referencesBackToGraph');

  root.innerHTML = `
    <header>
      <h1>${t('referencesHeaderTitle')}</h1>
      <p>${t('referencesHeaderSubtitle')}</p>
    </header>

    <h2>${text(copy.coreHeading, language)}</h2>
    <div class="ref-section">${renderReferenceSection(coreSources, language)}</div>

    <h2>${text(copy.issuerHeading, language)}</h2>
    <div class="ref-section">${renderReferenceSection(issuerSources, language)}</div>

    <h2>${text(copy.valuationHeading, language)}</h2>
    <div class="ref-section">${renderReferenceSection(valuationSources, language)}</div>

    <h2>${text(copy.quickRefHeading, language)}</h2>
    <div class="ref-section">${renderQuickRefTable(language)}</div>

    <h2>${text(copy.updatesHeading, language)}</h2>
    <div class="ref-section">${renderUpdates(language)}</div>

    <footer>${text(copy.footer, language)}</footer>
  `;

  syncLocalizedLinks(root);
}

bindLanguageToggle();
render(getLanguage());
onLanguageChange(render, { immediate: false });
