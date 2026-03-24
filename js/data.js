export const AIRLINE_GROUPS = {
  'Star Alliance': { color: '#fbbf24' },
  oneworld: { color: '#f87171' },
  SkyTeam: { color: '#60a5fa' },
  Independent: { color: '#a78bfa' },
};

export const HOTEL_GROUPS = {
  Luxury: { color: '#fbbf24' },
  'Mid-Scale': { color: '#60a5fa' },
  Economy: { color: '#a78bfa' },
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
  { id: 'AC', name: 'Air Canada (Aeroplan)', code: 'AC', group: 'Star Alliance', avgCpp: 1.5 },
  { id: 'NH', name: 'ANA (全日空)', code: 'NH', group: 'Star Alliance', avgCpp: 1.5 },
  { id: 'OZ', name: 'Asiana Airlines', code: 'OZ', group: 'Star Alliance', avgCpp: null },
  { id: 'AV', name: 'Avianca (LifeMiles)', code: 'AV', group: 'Star Alliance', avgCpp: 1.3 },
  { id: 'BR', name: 'EVA Air (长荣)', code: 'BR', group: 'Star Alliance', avgCpp: 1.2 },
  { id: 'LH', name: 'Lufthansa (M&M)', code: 'LH', group: 'Star Alliance', avgCpp: null },
  { id: 'SQ', name: 'Singapore (新航)', code: 'SQ', group: 'Star Alliance', avgCpp: 1.4 },
  { id: 'TK', name: 'Turkish (土航)', code: 'TK', group: 'Star Alliance', avgCpp: 1.4 },
  { id: 'UA', name: 'United (美联航)', code: 'UA', group: 'Star Alliance', avgCpp: 1.2 },
  { id: 'AA', name: 'American (AA)', code: 'AA', group: 'oneworld', avgCpp: 1.4 },
  { id: 'BA', name: 'British Airways', code: 'BA', group: 'oneworld', avgCpp: 1.2 },
  { id: 'CX', name: 'Cathay Pacific (国泰)', code: 'CX', group: 'oneworld', avgCpp: 1.3 },
  { id: 'IB', name: 'Iberia', code: 'IB', group: 'oneworld', avgCpp: 1.3 },
  { id: 'JL', name: 'Japan Airlines (日航)', code: 'JL', group: 'oneworld', avgCpp: 1.3 },
  { id: 'MH', name: 'Malaysia (马航)', code: 'MH', group: 'oneworld', avgCpp: null },
  { id: 'QF', name: 'Qantas (澳航)', code: 'QF', group: 'oneworld', avgCpp: 1.1 },
  { id: 'QR', name: 'Qatar (卡航)', code: 'QR', group: 'oneworld', avgCpp: 1.4 },
  { id: 'AM', name: 'Aeromexico', code: 'AM', group: 'SkyTeam', avgCpp: null },
  { id: 'AF', name: 'Air France/KLM (FB)', code: 'AF', group: 'SkyTeam', avgCpp: 1.2 },
  { id: 'DL', name: 'Delta (达美)', code: 'DL', group: 'SkyTeam', avgCpp: 1.2 },
  { id: 'KE', name: 'Korean Air (大韩)', code: 'KE', group: 'SkyTeam', avgCpp: null },
  { id: 'VS', name: 'Virgin Atlantic', code: 'VS', group: 'SkyTeam', avgCpp: 1.3 },
  { id: 'EK', name: 'Emirates (阿联酋)', code: 'EK', group: 'Independent', avgCpp: 1.0 },
  { id: 'EY', name: 'Etihad', code: 'EY', group: 'Independent', avgCpp: 1.2 },
  { id: 'HA', name: 'Hawaiian', code: 'HA', group: 'Independent', avgCpp: null },
  { id: 'B6', name: 'JetBlue', code: 'B6', group: 'Independent', avgCpp: null },
  { id: 'WN', name: 'Southwest (西南)', code: 'WN', group: 'Independent', avgCpp: null },
];

export const HOTELS = [
  { id: 'HY', name: 'World of Hyatt (凯悦)', code: 'HY', group: 'Luxury', avgCpp: 2.0 },
  { id: 'MB_H', name: 'Marriott Bonvoy (万豪)', code: 'MB', group: 'Luxury', avgCpp: 0.8 },
  { id: 'HH', name: 'Hilton Honors (希尔顿)', code: 'HH', group: 'Mid-Scale', avgCpp: 0.5 },
  { id: 'IHG', name: 'IHG One Rewards (洲际)', code: 'IHG', group: 'Mid-Scale', avgCpp: 0.5 },
  { id: 'WY', name: 'Wyndham Rewards (温德姆)', code: 'WY', group: 'Economy', avgCpp: 1.1 },
  { id: 'CH', name: 'Choice Privileges', code: 'CH', group: 'Economy', avgCpp: 0.6 },
  { id: 'AL', name: 'Accor Live Limitless (雅高)', code: 'AL', group: 'Luxury', avgCpp: 0.8 },
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
    destLabel: '航空公司',
    groupLabel: '联盟',
    groupOrder: ['Star Alliance', 'oneworld', 'SkyTeam', 'Independent'],
  },
  hotels: {
    destLabel: '酒店',
    groupLabel: '酒店集团',
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
