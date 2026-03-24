import {
  CARD_PROGRAMS,
  CARD_PROGRAMS_BY_ID,
  formatRatio,
  getModeData,
  isValueDestination,
} from './data.js';

const portalWrap = document.getElementById('portalTableWrap');
const destinationGrid = document.getElementById('destGrid');
const resultPanel = document.getElementById('resultPanel');

const state = {
  mode: 'airlines',
  selectedDestinationId: null,
};

function getSortedDestinations(mode) {
  const modeData = getModeData(mode);

  return modeData.destinations
    .filter(isValueDestination)
    .sort((left, right) => {
      const groupDiff = modeData.groupOrder.indexOf(left.group) - modeData.groupOrder.indexOf(right.group);
      return groupDiff !== 0 ? groupDiff : left.code.localeCompare(right.code);
    });
}

function renderPortalTable() {
  const bestPortalFlight = Math.max(...CARD_PROGRAMS.filter((card) => card.portal.flights).map((card) => card.portal.flights));
  const bestPortalHotel = Math.max(...CARD_PROGRAMS.filter((card) => card.portal.hotels).map((card) => card.portal.hotels));

  let html = `<table class="portal-table">
    <thead><tr>
      <th>积分计划</th><th>年费</th>
      <th>Portal 机票<br><span style="font-weight:400">CPP</span></th>
      <th>Portal 酒店<br><span style="font-weight:400">CPP</span></th>
      <th>Portal Earn Rate</th>
      <th>直连有效回报率</th>
      <th>Portal 有效回报率</th>
    </tr></thead><tbody>`;

  CARD_PROGRAMS.forEach((card) => {
    const flightClass = card.portal.flights === bestPortalFlight ? 'cpp-best' : '';
    const hotelClass = card.portal.hotels === bestPortalHotel ? 'cpp-best' : '';

    html += `<tr>
      <td><span class="card-dot-sm" style="background:${card.color}"></span>${card.displayName}</td>
      <td style="color:var(--dim);font-size:12px">${card.fee}</td>
      <td><span class="cpp-val ${flightClass}">${card.portal.flights !== null ? `${card.portal.flights}¢` : '<span class="cpp-na">—</span>'}</span></td>
      <td><span class="cpp-val ${hotelClass}">${card.portal.hotels !== null ? `${card.portal.hotels}¢` : '<span class="cpp-na">—</span>'}</span></td>
      <td style="font-size:11px;color:var(--dim)">${card.earn.portalFlights} 机票 / ${card.earn.portalHotels} 酒店</td>
      <td style="font-size:12px">${card.effectiveReturn.direct}</td>
      <td style="font-size:12px;font-weight:500">${card.effectiveReturn.portal}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  portalWrap.innerHTML = html;
}

function renderDestinationGrid() {
  const destinations = getSortedDestinations(state.mode);
  let html = '';
  let lastGroup = null;

  destinations.forEach((destination) => {
    const groupColor = getModeData(state.mode).groups[destination.group].color;

    if (destination.group !== lastGroup) {
      html += `<div style="grid-column:1/-1;font-size:10px;color:${groupColor};font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:${lastGroup ? '8' : '0'}px">${destination.group}</div>`;
      lastGroup = destination.group;
    }

    const isSelected = state.selectedDestinationId === destination.id ? ' selected' : '';
    html += `<button class="dest-btn${isSelected}" data-id="${destination.id}">
      <span class="code" style="color:${groupColor}">${destination.id.replace('_H', '')}</span>
      <span class="name">${destination.name}</span>
    </button>`;
  });

  destinationGrid.innerHTML = html;

  destinationGrid.querySelectorAll('.dest-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDestinationId = button.dataset.id;
      renderDestinationGrid();
      renderResult();
    });
  });
}

function renderResult() {
  if (!state.selectedDestinationId) {
    resultPanel.innerHTML = '<div class="result-empty">👆 选择一个航空公司或酒店，查看最佳转点方案</div>';
    return;
  }

  const modeData = getModeData(state.mode);
  const destinations = getSortedDestinations(state.mode);
  const destination = destinations.find((item) => item.id === state.selectedDestinationId);

  if (!destination) {
    resultPanel.innerHTML = '<div class="result-empty">当前目标暂无估值数据</div>';
    return;
  }

  const options = modeData.transfers
    .filter(([, destinationId]) => destinationId === state.selectedDestinationId)
    .map(([cardId, , ratio]) => {
      const card = CARD_PROGRAMS_BY_ID.get(cardId);
      if (!card) {
        return null;
      }

      const effectiveCpp = destination.avgCpp * ratio;
      const valueFor100k = Math.round((effectiveCpp * 100000) / 100);

      return {
        card,
        ratio,
        effectiveCpp,
        valueFor100k,
        pointsAfterTransfer: ratio * 100000,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.effectiveCpp - left.effectiveCpp);

  const bestOption = options[0] ?? null;

  let html = `<div class="result-title" style="color:${modeData.groups[destination.group].color}">${destination.name}</div>`;
  html += `<div class="result-sub">${destination.group} · 里程/积分均价 ${destination.avgCpp}¢/pt · ${options.length} 个积分计划可转入</div>`;

  if (!options.length) {
    html += '<div style="color:#666;padding:20px 0">没有直接转点伙伴</div>';
    resultPanel.innerHTML = html;
    return;
  }

  html += '<div class="transfer-cards">';
  options.forEach((option) => {
    const isBest = option === bestOption;

    html += `<div class="transfer-card${isBest ? ' best' : ''}" style="border-color:${option.card.color}22">
      ${isBest ? '<div class="badge">⭐ 推荐</div>' : ''}
      <div class="card-name" style="color:${option.card.color}">${option.card.displayName}</div>
      <div class="ratio">转点比例: <strong>${formatRatio(option.ratio)}</strong></div>
      <div class="ratio">年费: ${option.card.fee}</div>
      <div class="value-row">
        <div>
          <div class="value-big" style="color:${isBest ? '#10b981' : option.card.color}">${option.effectiveCpp.toFixed(1)}¢</div>
          <div class="value-unit">有效 CPP</div>
        </div>
        <div style="text-align:right">
          <div class="value-big" style="color:${isBest ? '#10b981' : '#ccc'}">$${option.valueFor100k}</div>
          <div class="value-unit">100k 积分价值</div>
        </div>
      </div>
      <div class="value-calc">100k → ${(option.pointsAfterTransfer / 1000).toFixed(0)}k miles × ${destination.avgCpp}¢ = $${option.valueFor100k}</div>
    </div>`;
  });
  html += '</div>';

  resultPanel.innerHTML = html;
}

document.querySelectorAll('.picker-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.picker-tab').forEach((button) => {
      button.classList.remove('active');
    });
    tab.classList.add('active');
    state.mode = tab.dataset.pick;
    state.selectedDestinationId = null;
    renderDestinationGrid();
    renderResult();
  });
});

renderPortalTable();
renderDestinationGrid();
renderResult();
