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
  buildPageUrl,
  getLanguage,
  onLanguageChange,
  setDocumentMeta,
  syncLocalizedLinks,
  t,
  updateUrlParams,
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
const destinationSearchInput = document.getElementById('destSearch');
const destinationSearchLabel = document.getElementById('dest-search-label');
const destinationSortLabel = document.getElementById('dest-sort-label');
const cardSortLabel = document.getElementById('card-sort-label');
const destinationSortSelect = document.getElementById('destSort');
const cardSortSelect = document.getElementById('cardSort');
const destinationSummary = document.getElementById('destSummary');
const destinationEmpty = document.getElementById('destEmpty');

function normalizeMode(mode) {
  return mode === 'hotels' ? 'hotels' : 'airlines';
}

function normalizeDestinationSort(sort) {
  return ['group', 'value', 'az'].includes(sort) ? sort : 'group';
}

function normalizeCardSort(sort) {
  return ['value', 'fee', 'ratio'].includes(sort) ? sort : 'value';
}

function readInitialStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    mode: normalizeMode(params.get('mode')),
    selectedDestinationId: params.get('dest'),
    searchQuery: params.get('q') ?? '',
    destinationSort: normalizeDestinationSort(params.get('destSort')),
    cardSort: normalizeCardSort(params.get('cardSort')),
  };
}

function getAnnualFeeValue(card) {
  const matches = String(card.fee).match(/\d+/g);
  return matches?.length ? Number(matches[0]) : Number.POSITIVE_INFINITY;
}

const initialState = readInitialStateFromUrl();

const state = {
  language: getLanguage(),
  mode: initialState.mode,
  selectedDestinationId: initialState.selectedDestinationId,
  searchQuery: initialState.searchQuery,
  destinationSort: initialState.destinationSort,
  cardSort: initialState.cardSort,
};

function getAllValueDestinations(mode) {
  const modeData = getModeData(mode);

  return modeData.destinations.filter(isValueDestination);
}

function getSortedDestinations(mode) {
  const modeData = getModeData(mode);
  const query = state.searchQuery.trim().toLowerCase();

  return getAllValueDestinations(mode)
    .filter((destination) => {
      if (!query) {
        return true;
      }

      const haystack = [
        destination.id,
        destination.code,
        getLocalizedDestinationName(destination, state.language),
        getLocalizedGroupName(mode, destination.group, state.language),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort((left, right) => {
      if (state.destinationSort === 'value') {
        return (right.avgCpp ?? 0) - (left.avgCpp ?? 0) || left.code.localeCompare(right.code);
      }

      if (state.destinationSort === 'az') {
        return getLocalizedDestinationName(left, state.language)
          .localeCompare(getLocalizedDestinationName(right, state.language), state.language);
      }

      const groupDiff = modeData.groupOrder.indexOf(left.group) - modeData.groupOrder.indexOf(right.group);
      return groupDiff !== 0 ? groupDiff : left.code.localeCompare(right.code);
    });
}

function ensureValidSelection(visibleDestinations = getSortedDestinations(state.mode)) {
  if (!state.selectedDestinationId) {
    return;
  }

  const stillVisible = visibleDestinations.some((destination) => destination.id === state.selectedDestinationId);
  if (!stillVisible) {
    state.selectedDestinationId = null;
  }
}

function syncStateToUrl() {
  updateUrlParams({
    lang: state.language,
    mode: state.mode,
    dest: state.selectedDestinationId,
    q: state.searchQuery.trim() || null,
    destSort: state.destinationSort === 'group' ? null : state.destinationSort,
    cardSort: state.cardSort === 'value' ? null : state.cardSort,
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
  const totalDestinations = getAllValueDestinations(state.mode).length;
  let html = '';
  let lastGroup = null;

  destinationSummary.textContent = t('destinationSummary', {
    count: destinations.length,
    total: totalDestinations,
  });

  destinationEmpty.hidden = destinations.length > 0;
  destinationGrid.hidden = destinations.length === 0;

  if (!destinations.length) {
    destinationEmpty.textContent = t('noDestinationMatches');
    destinationGrid.innerHTML = '';
    return;
  }

  destinations.forEach((destination) => {
    const groupColor = getModeData(state.mode).groups[destination.group].color;

    if (state.destinationSort === 'group' && destination.group !== lastGroup) {
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
      renderAll();
    });
  });
}

function renderResult() {
  if (!state.selectedDestinationId) {
    resultPanel.innerHTML = `<div class="result-empty">${t('pickPrompt')}</div>`;
    return;
  }

  const modeData = getModeData(state.mode);
  const destinations = getAllValueDestinations(state.mode);
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
    .sort((left, right) => {
      if (state.cardSort === 'fee') {
        return getAnnualFeeValue(left.card) - getAnnualFeeValue(right.card) || right.effectiveCpp - left.effectiveCpp;
      }

      if (state.cardSort === 'ratio') {
        return right.ratio - left.ratio || right.effectiveCpp - left.effectiveCpp;
      }

      return right.effectiveCpp - left.effectiveCpp || left.card.shortName.localeCompare(right.card.shortName);
    });

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

  backLink.setAttribute('href', buildPageUrl('index.html'));
  backLink.textContent = t('backToGraph');
  pageTitle.textContent = t('redemptionHeaderTitle');
  pageSubtitle.textContent = t('redemptionHeaderSubtitle');
  portalSectionTitle.textContent = t('portalSectionTitle');
  pickerSectionTitle.textContent = t('pickerSectionTitle');
  destinationSearchLabel.textContent = t('destinationSearchLabel');
  destinationSearchInput.placeholder = t('destinationSearchPlaceholder');
  destinationSortLabel.textContent = t('destinationSortLabel');
  cardSortLabel.textContent = t('cardSortLabel');
  destinationSortSelect.options[0].textContent = t('destinationSortGroup');
  destinationSortSelect.options[1].textContent = t('destinationSortValue');
  destinationSortSelect.options[2].textContent = t('destinationSortAz');
  cardSortSelect.options[0].textContent = t('cardSortValue');
  cardSortSelect.options[1].textContent = t('cardSortFee');
  cardSortSelect.options[2].textContent = t('cardSortRatio');
  document.querySelector('[data-pick="airlines"]').textContent = t('modeAirlines');
  document.querySelector('[data-pick="hotels"]').textContent = t('modeHotels');
  footer.innerHTML = `by <a href="https://github.com/1suponatime">1suponatime</a> · 2026.3 · <a href="index.html">${t('footerGraphLink')}</a> · <a href="references.html">${t('footerReferencesLink')}</a> · <a href="https://github.com/1suponatime/credit-card-transfer-graph/issues">${t('footerIssuesLink')}</a>`;
  syncLocalizedLinks(document.body);
}

function renderAll() {
  ensureValidSelection();
  syncStateToUrl();
  renderPortalTable();
  renderDestinationGrid();
  renderResult();
}

document.querySelectorAll('.picker-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.picker-tab').forEach((button) => {
      button.classList.remove('active');
    });
    tab.classList.add('active');
    state.mode = tab.dataset.pick;
    state.selectedDestinationId = null;
    renderAll();
  });
});

destinationSearchInput.addEventListener('input', () => {
  state.searchQuery = destinationSearchInput.value;
  renderAll();
});

destinationSortSelect.addEventListener('change', () => {
  state.destinationSort = normalizeDestinationSort(destinationSortSelect.value);
  renderAll();
});

cardSortSelect.addEventListener('change', () => {
  state.cardSort = normalizeCardSort(cardSortSelect.value);
  renderAll();
});

bindLanguageToggle();
updateStaticCopy();
destinationSearchInput.value = state.searchQuery;
destinationSortSelect.value = state.destinationSort;
cardSortSelect.value = state.cardSort;
document.querySelectorAll('.picker-tab').forEach((tab) => {
  tab.classList.toggle('active', tab.dataset.pick === state.mode);
});
renderAll();

onLanguageChange(
  (language) => {
    state.language = language;
    updateStaticCopy();
    renderAll();
  },
  { immediate: false },
);
