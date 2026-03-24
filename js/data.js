const bilingual = (zh, en) => ({ 'zh-CN': zh, en });

export const AIRLINE_GROUPS = {
  'Star Alliance': { color: '#fbbf24', label: bilingual('星空联盟', 'Star Alliance') },
  oneworld: { color: '#f87171', label: bilingual('寰宇一家', 'oneworld') },
  SkyTeam: { color: '#60a5fa', label: bilingual('天合联盟', 'SkyTeam') },
  Independent: { color: '#a78bfa', label: bilingual('独立航司', 'Independent') },
};

export const HOTEL_GROUPS = {
  Luxury: { color: '#fbbf24', label: bilingual('豪华酒店', 'Luxury') },
  'Mid-Scale': { color: '#60a5fa', label: bilingual('中端酒店', 'Mid-Scale') },
  Economy: { color: '#a78bfa', label: bilingual('经济酒店', 'Economy') },
};

export const PRIMARY_REF = 'https://www.uscreditcardguide.com/wings-of-the-points/';

export const CARD_PROGRAMS = [
  {
    id: 'UR',
    shortName: 'Chase UR',
    displayName: 'Chase UR',
    fullName: 'Chase Ultimate Rewards',
    color: '#3b82f6',
    ref: 'https://ultimaterewardspoints.chase.com/transfer-partners',
    fee: '$795 (CSR)',
    portal: { flights: 1.5, hotels: 1.5, note: 'Points Boost 浮动' },
    earn: {
      portalFlights: '8×',
      portalHotels: '8×',
      directFlights: '4×',
      directHotels: '4×',
      general: '1×',
    },
    effectiveReturn: {
      portal: '8× · 1.5¢ = 12%',
      direct: '4× · 1.7¢ = 6.8%',
    },
  },
  {
    id: 'MR',
    shortName: 'Amex MR',
    displayName: 'Amex MR',
    fullName: 'Amex Membership Rewards',
    color: '#10b981',
    ref: 'https://global.americanexpress.com/rewards/transfer',
    fee: '$895 (Plat)',
    portal: { flights: 1.0, hotels: 0.7, note: '' },
    earn: {
      portalFlights: '5×',
      portalHotels: '5×',
      directFlights: '5×',
      directHotels: '1×',
      general: '1×',
    },
    effectiveReturn: {
      portal: '5× · 1¢ = 5%',
      direct: '5× · 1.6¢ = 8%',
    },
  },
  {
    id: 'TYP',
    shortName: 'Citi TYP',
    displayName: 'Citi TYP',
    fullName: 'Citi ThankYou Points',
    color: '#6366f1',
    ref: 'https://www.thankyou.com/redeem/transfer-partners',
    fee: '$95 (Strata)',
    portal: { flights: 1.0, hotels: 1.0, note: '' },
    earn: {
      portalFlights: '3×',
      portalHotels: '10×',
      directFlights: '3×',
      directHotels: '3×',
      general: '1×',
    },
    effectiveReturn: {
      portal: '10× · 1¢ = 10%',
      direct: '3× · 1.4¢ = 4.2%',
    },
  },
  {
    id: 'C1',
    shortName: 'Cap One',
    displayName: 'Capital One',
    fullName: 'Capital One Miles',
    color: '#ef4444',
    ref: 'https://www.capitalone.com/credit-cards/benefits/transfer-miles/',
    fee: '$395 (VX)',
    portal: { flights: 1.0, hotels: 1.0, note: '' },
    earn: {
      portalFlights: '5×',
      portalHotels: '10×',
      directFlights: '2×',
      directHotels: '2×',
      general: '2×',
    },
    effectiveReturn: {
      portal: '10× · 1¢ = 10%',
      direct: '2× · 1.5¢ = 3%',
    },
  },
  {
    id: 'Bilt',
    shortName: 'Bilt',
    displayName: 'Bilt',
    fullName: 'Bilt Rewards',
    color: '#f59e0b',
    ref: 'https://www.biltrewards.com/transfer-partners',
    fee: '$0–$495',
    portal: { flights: 1.25, hotels: 1.25, note: '固定值' },
    earn: {
      portalFlights: '2×',
      portalHotels: '2×',
      directFlights: '2×',
      directHotels: '2×',
      general: '1×',
    },
    effectiveReturn: {
      portal: '2× · 1.25¢ = 2.5%',
      direct: '2× · 2.0¢ = 4%',
    },
  },
  {
    id: 'MB',
    shortName: 'Marriott',
    displayName: 'Marriott Bonvoy',
    fullName: 'Marriott Bonvoy',
    color: '#ec4899',
    ref: 'https://www.marriott.com/loyalty/redeem/travel/airlines.mi',
    fee: '$0–$650',
    portal: { flights: null, hotels: 0.9, note: '直接兑换' },
    earn: {
      portalFlights: '—',
      portalHotels: '—',
      directFlights: '—',
      directHotels: '—',
      general: '—',
    },
    effectiveReturn: {
      portal: 'N/A',
      direct: '0.7–1.2¢/pt',
    },
  },
];

export const AIRLINES = [
  { id: 'AC', name: bilingual('加拿大航空 (Aeroplan)', 'Air Canada (Aeroplan)'), code: 'AC', group: 'Star Alliance', avgCpp: 1.5 },
  { id: 'NH', name: bilingual('全日空 ANA', 'ANA'), code: 'NH', group: 'Star Alliance', avgCpp: 1.5 },
  { id: 'OZ', name: bilingual('韩亚航空', 'Asiana Airlines'), code: 'OZ', group: 'Star Alliance', avgCpp: null },
  { id: 'AV', name: bilingual('Avianca (LifeMiles)', 'Avianca (LifeMiles)'), code: 'AV', group: 'Star Alliance', avgCpp: 1.3 },
  { id: 'BR', name: bilingual('长荣航空', 'EVA Air'), code: 'BR', group: 'Star Alliance', avgCpp: 1.2 },
  { id: 'LH', name: bilingual('汉莎航空 (Miles & More)', 'Lufthansa (Miles & More)'), code: 'LH', group: 'Star Alliance', avgCpp: null },
  { id: 'SQ', name: bilingual('新加坡航空', 'Singapore Airlines'), code: 'SQ', group: 'Star Alliance', avgCpp: 1.4 },
  { id: 'TK', name: bilingual('土耳其航空', 'Turkish Airlines'), code: 'TK', group: 'Star Alliance', avgCpp: 1.4 },
  { id: 'UA', name: bilingual('美联航', 'United Airlines'), code: 'UA', group: 'Star Alliance', avgCpp: 1.2 },
  { id: 'AA', name: bilingual('美国航空', 'American Airlines'), code: 'AA', group: 'oneworld', avgCpp: 1.4 },
  { id: 'BA', name: bilingual('英国航空', 'British Airways'), code: 'BA', group: 'oneworld', avgCpp: 1.2 },
  { id: 'CX', name: bilingual('国泰航空', 'Cathay Pacific'), code: 'CX', group: 'oneworld', avgCpp: 1.3 },
  { id: 'IB', name: bilingual('西班牙航空', 'Iberia'), code: 'IB', group: 'oneworld', avgCpp: 1.3 },
  { id: 'JL', name: bilingual('日本航空', 'Japan Airlines'), code: 'JL', group: 'oneworld', avgCpp: 1.3 },
  { id: 'MH', name: bilingual('马来西亚航空', 'Malaysia Airlines'), code: 'MH', group: 'oneworld', avgCpp: null },
  { id: 'QF', name: bilingual('澳洲航空', 'Qantas'), code: 'QF', group: 'oneworld', avgCpp: 1.1 },
  { id: 'QR', name: bilingual('卡塔尔航空', 'Qatar Airways'), code: 'QR', group: 'oneworld', avgCpp: 1.4 },
  { id: 'AM', name: bilingual('墨西哥航空', 'Aeromexico'), code: 'AM', group: 'SkyTeam', avgCpp: null },
  { id: 'AF', name: bilingual('法航/荷航 (Flying Blue)', 'Air France/KLM (Flying Blue)'), code: 'AF', group: 'SkyTeam', avgCpp: 1.2 },
  { id: 'DL', name: bilingual('达美航空', 'Delta Air Lines'), code: 'DL', group: 'SkyTeam', avgCpp: 1.2 },
  { id: 'KE', name: bilingual('大韩航空', 'Korean Air'), code: 'KE', group: 'SkyTeam', avgCpp: null },
  { id: 'VS', name: bilingual('维珍大西洋', 'Virgin Atlantic'), code: 'VS', group: 'SkyTeam', avgCpp: 1.3 },
  { id: 'EK', name: bilingual('阿联酋航空', 'Emirates'), code: 'EK', group: 'Independent', avgCpp: 1.0 },
  { id: 'EY', name: bilingual('阿提哈德航空', 'Etihad Airways'), code: 'EY', group: 'Independent', avgCpp: 1.2 },
  { id: 'HA', name: bilingual('夏威夷航空', 'Hawaiian Airlines'), code: 'HA', group: 'Independent', avgCpp: null },
  { id: 'B6', name: bilingual('捷蓝航空', 'JetBlue'), code: 'B6', group: 'Independent', avgCpp: null },
  { id: 'WN', name: bilingual('西南航空', 'Southwest Airlines'), code: 'WN', group: 'Independent', avgCpp: null },
];

export const HOTELS = [
  { id: 'HY', name: bilingual('凯悦天地', 'World of Hyatt'), code: 'HY', group: 'Luxury', avgCpp: 2.0 },
  { id: 'MB_H', name: bilingual('万豪旅享家', 'Marriott Bonvoy'), code: 'MB', group: 'Luxury', avgCpp: 0.8 },
  { id: 'HH', name: bilingual('希尔顿荣誉客会', 'Hilton Honors'), code: 'HH', group: 'Mid-Scale', avgCpp: 0.5 },
  { id: 'IHG', name: bilingual('IHG 优悦会', 'IHG One Rewards'), code: 'IHG', group: 'Mid-Scale', avgCpp: 0.5 },
  { id: 'WY', name: bilingual('温德姆奖赏计划', 'Wyndham Rewards'), code: 'WY', group: 'Economy', avgCpp: 1.1 },
  { id: 'CH', name: bilingual('Choice Privileges', 'Choice Privileges'), code: 'CH', group: 'Economy', avgCpp: 0.6 },
  { id: 'AL', name: bilingual('雅高心悦界', 'Accor Live Limitless'), code: 'AL', group: 'Luxury', avgCpp: 0.8 },
];

export const AIRLINE_TRANSFERS = [
  ['UR', 'AC', 1], ['UR', 'BA', 1], ['UR', 'AF', 1], ['UR', 'IB', 1], ['UR', 'SQ', 1], ['UR', 'UA', 1], ['UR', 'VS', 1], ['UR', 'B6', 1], ['UR', 'WN', 1], ['UR', 'BR', 1], ['UR', 'EK', 1],
  ['MR', 'AC', 1], ['MR', 'NH', 0.5], ['MR', 'AV', 1], ['MR', 'BA', 1], ['MR', 'CX', 0.8], ['MR', 'DL', 1], ['MR', 'EK', 1], ['MR', 'EY', 1], ['MR', 'AF', 1], ['MR', 'HA', 1], ['MR', 'IB', 1], ['MR', 'SQ', 1], ['MR', 'VS', 1], ['MR', 'QF', 1], ['MR', 'B6', 0.8],
  ['TYP', 'AC', 1], ['TYP', 'AV', 1], ['TYP', 'CX', 1], ['TYP', 'EK', 1], ['TYP', 'EY', 1], ['TYP', 'BR', 1], ['TYP', 'AF', 1], ['TYP', 'B6', 1], ['TYP', 'MH', 1], ['TYP', 'QF', 1], ['TYP', 'QR', 1], ['TYP', 'SQ', 1], ['TYP', 'TK', 1], ['TYP', 'VS', 1],
  ['C1', 'AC', 1], ['C1', 'AV', 1], ['C1', 'BA', 1], ['C1', 'CX', 1], ['C1', 'EK', 1], ['C1', 'EY', 1], ['C1', 'BR', 1], ['C1', 'AF', 1], ['C1', 'IB', 1], ['C1', 'JL', 0.75], ['C1', 'QR', 1], ['C1', 'SQ', 1], ['C1', 'TK', 1], ['C1', 'VS', 1],
  ['Bilt', 'AA', 1], ['Bilt', 'AC', 1], ['Bilt', 'AF', 1], ['Bilt', 'BA', 1], ['Bilt', 'CX', 1], ['Bilt', 'EK', 1], ['Bilt', 'IB', 1], ['Bilt', 'TK', 1], ['Bilt', 'UA', 1], ['Bilt', 'VS', 1], ['Bilt', 'QR', 1],
  ['MB', 'AA', 0.42], ['MB', 'AC', 0.42], ['MB', 'NH', 0.42], ['MB', 'AV', 0.42], ['MB', 'BA', 0.42], ['MB', 'CX', 0.42], ['MB', 'DL', 0.42], ['MB', 'EK', 0.42], ['MB', 'EY', 0.42], ['MB', 'AF', 0.42], ['MB', 'HA', 0.42], ['MB', 'IB', 0.42], ['MB', 'JL', 0.42], ['MB', 'KE', 0.42], ['MB', 'LH', 0.42], ['MB', 'MH', 0.42], ['MB', 'QF', 0.42], ['MB', 'QR', 0.42], ['MB', 'SQ', 0.42], ['MB', 'TK', 0.42], ['MB', 'UA', 0.37], ['MB', 'VS', 0.42],
];

export const HOTEL_TRANSFERS = [
  ['UR', 'HY', 1], ['UR', 'IHG', 1], ['UR', 'MB_H', 1], ['UR', 'WY', 1],
  ['MR', 'HH', 2], ['MR', 'MB_H', 1], ['MR', 'CH', 1],
  ['TYP', 'WY', 1], ['TYP', 'CH', 1], ['TYP', 'AL', 0.5],
  ['C1', 'WY', 1], ['C1', 'CH', 1], ['C1', 'AL', 0.5],
  ['Bilt', 'HY', 1], ['Bilt', 'HH', 1], ['Bilt', 'IHG', 1], ['Bilt', 'MB_H', 1], ['Bilt', 'AL', 0.67],
];

export const CARD_PROGRAMS_BY_ID = new Map(CARD_PROGRAMS.map((card) => [card.id, card]));

export const DESTINATIONS_BY_MODE = {
  airlines: AIRLINES,
  hotels: HOTELS,
};

export const TRANSFERS_BY_MODE = {
  airlines: AIRLINE_TRANSFERS,
  hotels: HOTEL_TRANSFERS,
};

export const GROUPS_BY_MODE = {
  airlines: AIRLINE_GROUPS,
  hotels: HOTEL_GROUPS,
};

export const MODE_META = {
  airlines: {
    destLabel: bilingual('航空公司', 'Airlines'),
    groupLabel: bilingual('联盟', 'Alliance'),
    groupOrder: ['Star Alliance', 'oneworld', 'SkyTeam', 'Independent'],
  },
  hotels: {
    destLabel: bilingual('酒店', 'Hotels'),
    groupLabel: bilingual('酒店集团', 'Hotel Groups'),
    groupOrder: ['Luxury', 'Mid-Scale', 'Economy'],
  },
};

export function getModeData(mode) {
  return {
    destinations: DESTINATIONS_BY_MODE[mode] ?? [],
    transfers: TRANSFERS_BY_MODE[mode] ?? [],
    groups: GROUPS_BY_MODE[mode] ?? {},
    ...MODE_META[mode],
  };
}

export function getLocalizedText(value, language = 'zh-CN') {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  return value[language] ?? value.en ?? value['zh-CN'] ?? '';
}

export function getLocalizedDestinationName(destination, language = 'zh-CN') {
  return getLocalizedText(destination?.name, language);
}

export function getLocalizedGroupName(mode, group, language = 'zh-CN') {
  return getLocalizedText(GROUPS_BY_MODE[mode]?.[group]?.label ?? group, language);
}

export function dedupeTransfers(transfers) {
  const out = [];
  const seen = new Set();

  for (const transfer of transfers) {
    const key = `${transfer[0]}-${transfer[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(transfer);
    }
  }

  return out;
}

export function formatRatio(ratio) {
  return ratio === 1 ? '1 : 1' : `1 : ${ratio}`;
}

export function isValueDestination(destination) {
  return typeof destination.avgCpp === 'number';
}
