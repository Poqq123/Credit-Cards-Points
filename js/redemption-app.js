import {
  CARD_PROGRAMS,
  CARD_PROGRAMS_BY_ID,
  formatRatio,
  getModeData,
  getLocalizedDestinationName,
  getLocalizedGroupName,
  getLocalizedText,
  isValueDestination,
} from './data.js';
import {
  bindLanguageToggle,
  getLanguage,
  onLanguageChange,
  setDocumentMeta,
  t,
} from './i18n.js';

const backLink = document.getElementById('back-link');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const portalSectionTitle = document.getElementById('portal-section-title');
const pickerSectionTitle = document.getElementById('picker-section-title');
const portalWrap = document.getElementById('portalTableWrap');
const destinationGrid = document.getElementById('destGrid');
const resultPanel = document.getElementById('resultPanel');
const footer = document.getElementById('page-footer');

const state = {
  language: getLanguage(),
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
      <th>${t('portalProgram')}</th><th>${t('annualFee')}</th>
      <th>${t('portalFlights')}<br><span style="font-weight:400">CPP</span></th>
      <th>${t('portalHotels')}<br><span style="font-weight:400">CPP</span></th>
      <th>${t('portalEarnRate')}</th>
      <th>${t('directReturn')}</th>
      <th>${t('portalReturn')}</th>
    </tr></thead><tbody>`;

  CARD_PROGRAMS.forEach((card) => {
    const flightClass = card.portal.flights === bestPortalFlight ? 'cpp-best' : '';
    const hotelClass = card.portal.hotels === bestPortalHotel ? 'cpp-best' : '';

    html += `<tr>
      <td><span class="card-dot-sm" style="background:${card.color}"></span>${getLocalizedText(card.displayName, state.language)}</td>
      <td style="color:var(--dim);font-size:12px">${card.fee}</td>
      <td><span class="cpp-val ${flightClass}">${card.portal.flights !== null ? `${card.portal.flights}¢` : '<span class="cpp-na">—</span>'}</span></td>
      <td><span class="cpp-val ${hotelClass}">${card.portal.hotels !== null ? `${card.portal.hotels}¢` : '<span class="cpp-na">—</span>'}</span></td>
      <td style="font-size:11px;color:var(--dim)">${t('earnSummary', {
        flights: card.earn.portalFlights,
        hotels: card.earn.portalHotels,
      })}</td>
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
      html += `<div style="grid-column:1/-1;font-size:10px;color:${groupColor};font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:${lastGroup ? '8' : '0'}px">${getLocalizedGroupName(state.mode, destination.group, state.language)}</div>`;
      lastGroup = destination.group;
    }

    const isSelected = state.selectedDestinationId === destination.id ? ' selected' : '';
    html += `<button class="dest-btn${isSelected}" data-id="${destination.id}">
      <span class="code" style="color:${groupColor}">${destination.id.replace('_H', '')}</span>
      <span class="name">${getLocalizedDestinationName(destination, state.language)}</span>
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
    resultPanel.innerHTML = `<div class="result-empty">${t('pickPrompt')}</div>`;
    return;
  }

  const modeData = getModeData(state.mode);
  const destinations = getSortedDestinations(state.mode);
  const destination = destinations.find((item) => item.id === state.selectedDestinationId);

  if (!destination) {
    resultPanel.innerHTML = `<div class="result-empty">${t('noValuation')}</div>`;
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

  let html = `<div class="result-title" style="color:${modeData.groups[destination.group].color}">${getLocalizedDestinationName(destination, state.language)}</div>`;
  html += `<div class="result-sub">${t('resultSubtitle', {
    group: getLocalizedGroupName(state.mode, destination.group, state.language),
    avgCpp: destination.avgCpp,
    count: options.length,
  })}</div>`;

  if (!options.length) {
    html += `<div style="color:#666;padding:20px 0">${t('noPartners')}</div>`;
    resultPanel.innerHTML = html;
    return;
  }

  html += '<div class="transfer-cards">';
  options.forEach((option) => {
    const isBest = option === bestOption;
    const pointsUnit = state.mode === 'airlines' ? t('unitMiles') : t('unitPoints');

    html += `<div class="transfer-card${isBest ? ' best' : ''}" style="border-color:${option.card.color}22">
      ${isBest ? `<div class="badge">${t('recommended')}</div>` : ''}
      <div class="card-name" style="color:${option.card.color}">${getLocalizedText(option.card.displayName, state.language)}</div>
      <div class="ratio">${t('transferRatio')}: <strong>${formatRatio(option.ratio)}</strong></div>
      <div class="ratio">${t('annualFee')}: ${option.card.fee}</div>
      <div class="value-row">
        <div>
          <div class="value-big" style="color:${isBest ? '#10b981' : option.card.color}">${option.effectiveCpp.toFixed(1)}¢</div>
          <div class="value-unit">${t('effectiveCpp')}</div>
        </div>
        <div style="text-align:right">
          <div class="value-big" style="color:${isBest ? '#10b981' : '#ccc'}">$${option.valueFor100k}</div>
          <div class="value-unit">${t('value100k')}</div>
        </div>
      </div>
      <div class="value-calc">${t('valueCalc', {
        points: (option.pointsAfterTransfer / 1000).toFixed(0),
        unit: pointsUnit,
        avgCpp: destination.avgCpp,
        value: option.valueFor100k,
      })}</div>
    </div>`;
  });
  html += '</div>';

  resultPanel.innerHTML = html;
}

function updateStaticCopy() {
  setDocumentMeta({
    title: t('redemptionDocTitle'),
    description: t('redemptionMetaDescription'),
  });

  backLink.textContent = t('backToGraph');
  pageTitle.textContent = t('redemptionHeaderTitle');
  pageSubtitle.textContent = t('redemptionHeaderSubtitle');
  portalSectionTitle.textContent = t('portalSectionTitle');
  pickerSectionTitle.textContent = t('pickerSectionTitle');
  document.querySelector('[data-pick="airlines"]').textContent = t('modeAirlines');
  document.querySelector('[data-pick="hotels"]').textContent = t('modeHotels');
  footer.innerHTML = `by <a href="https://github.com/1suponatime">1suponatime</a> · 2026.3 · <a href="index.html">${t('footerGraphLink')}</a> · <a href="references.html">${t('footerReferencesLink')}</a> · <a href="https://github.com/1suponatime/credit-card-transfer-graph/issues">${t('footerIssuesLink')}</a>`;
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

bindLanguageToggle();
updateStaticCopy();
renderPortalTable();
renderDestinationGrid();
renderResult();

onLanguageChange(
  (language) => {
    state.language = language;
    updateStaticCopy();
    renderPortalTable();
    renderDestinationGrid();
    renderResult();
  },
  { immediate: false },
);
