import * as THREE from 'three';
import {
  AIRLINE_GROUPS,
  CARD_PROGRAMS,
  CARD_PROGRAMS_BY_ID,
  dedupeTransfers,
  formatRatio,
  getModeData,
  getLocalizedDestinationName,
  getLocalizedGroupName,
  getLocalizedText,
} from './data.js';
import {
  bindLanguageToggle,
  getLanguage,
  onLanguageChange,
  setDocumentMeta,
  syncLocalizedLinks,
  t,
  updateUrlParams,
} from './i18n.js';

const refs = {
  container: document.getElementById('canvas-container'),
  tooltip: document.getElementById('tooltip'),
  legend: document.getElementById('legend'),
  titleBar: document.getElementById('title-bar'),
  pageTitle: document.getElementById('page-title'),
  pageSubtitle: document.getElementById('page-subtitle'),
  statCards: document.getElementById('stat-cards'),
  statCardsLabel: document.getElementById('stat-cards-label'),
  statDestLabel: document.getElementById('stat-dest-label'),
  statDest: document.getElementById('stat-dest'),
  statEdges: document.getElementById('stat-edges'),
  statEdgesLabel: document.getElementById('stat-edges-label'),
  statGroupLabel: document.getElementById('stat-group-label'),
  statGroups: document.getElementById('stat-groups'),
  controlsHint: document.getElementById('controls-hint'),
  panelTitle: document.getElementById('panel-title'),
};

const scene = new THREE.Scene();
const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  language: getLanguage(),
  currentMode: 'airlines',
  currentTransfers: [],
  currentDestinations: [],
  currentGroups: AIRLINE_GROUPS,
  currentConnectionsByNode: new Map(),
  nodeMeshes: {},
  nodeData: {},
  labelSprites: {},
  glowMeshes: {},
  edgeMeshes: [],
  edgeDataMap: [],
  meshIds: new Map(),
  nodePositions: {},
  highlightedIds: null,
  particleSystem: null,
  particleGeo: null,
  particleMat: null,
  particlePositions: null,
  particleProgress: null,
  particleSpeeds: null,
  particleEdgeIndex: null,
  particleCount: 0,
  hoveredNode: null,
  lockedNode: null,
  selectedGroup: null,
  panOffset: { x: 0, y: 0 },
  zoomLevel: 1,
  isPanning: false,
  panStart: { x: 0, y: 0 },
};

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const camera = new THREE.OrthographicCamera(
  -state.width / 2,
  state.width / 2,
  state.height / 2,
  -state.height / 2,
  -1000,
  1000,
);

camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(state.width, state.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
refs.container.appendChild(renderer.domElement);

const nodeGroup = new THREE.Group();
const edgeGroup = new THREE.Group();
const labelGroup = new THREE.Group();
scene.add(edgeGroup);
scene.add(nodeGroup);
scene.add(labelGroup);

function isMobile() {
  return state.width < 640;
}

function normalizeMode(mode) {
  return mode === 'hotels' ? 'hotels' : 'airlines';
}

function getGraphUrlState() {
  const params = new URLSearchParams(window.location.search);

  return {
    mode: normalizeMode(params.get('mode')),
    group: params.get('group'),
    node: params.get('node'),
  };
}

function syncGraphUrlState() {
  updateUrlParams({
    lang: state.language,
    mode: state.currentMode,
    group: state.selectedGroup,
    node: state.lockedNode,
  });
}

function setActiveModeButton(mode) {
  document.querySelectorAll('.mode-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
}

const CARD_LOGO_ASSETS = {
  UR: {
    src: new URL('../image/logo_chase_headerfooter.svg', import.meta.url).href,
    width: 42,
    height: 12,
  },
  MR: {
    src: new URL('../image/dls-logo-bluebox-solid.svg', import.meta.url).href,
    width: 26,
    height: 26,
  },
  TYP: {
    src: new URL('../image/citiredesign.svg', import.meta.url).href,
    width: 30,
    height: 18,
    sourceRect: { x: 16.5, y: 28.32, width: 56, height: 32.36 },
  },
  C1: {
    src: new URL('../image/Capital_One_logo.svg.png', import.meta.url).href,
    width: 34,
    height: 18,
  },
  Bilt: {
    src: new URL('../image/bilt-rewards.svg', import.meta.url).href,
    width: 42,
    height: 14,
    badge: {
      fill: 'rgba(255,255,255,0.96)',
      stroke: 'rgba(255,255,255,0.2)',
      paddingX: 4,
      paddingY: 3,
      radius: 6,
    },
  },
  MB: {
    src: new URL('../image/marriott.svg', import.meta.url).href,
    width: 20,
    height: 20,
  },
};

const cardLogoCache = new Map();

function getCardLogoImage(cardId) {
  const asset = CARD_LOGO_ASSETS[cardId];
  if (!asset) {
    return null;
  }

  if (!cardLogoCache.has(cardId)) {
    const image = new Image();
    image.decoding = 'async';
    image.src = asset.src;
    cardLogoCache.set(cardId, image);
  }

  return cardLogoCache.get(cardId);
}

function drawAssetLogo(ctx, image, asset, x, y, boxWidth, boxHeight) {
  if (!image?.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    return false;
  }

  const badge = asset.badge ?? null;
  let targetX = x;
  let targetY = y;
  let targetWidth = boxWidth;
  let targetHeight = boxHeight;

  if (badge) {
    const paddingX = badge.paddingX ?? 0;
    const paddingY = badge.paddingY ?? 0;
    drawRoundedRect(ctx, x, y, boxWidth, boxHeight, badge.radius ?? Math.min(boxWidth, boxHeight) / 2);
    ctx.fillStyle = badge.fill;
    ctx.strokeStyle = badge.stroke ?? 'transparent';
    ctx.lineWidth = 1;
    ctx.fill();
    if (badge.stroke) {
      ctx.stroke();
    }

    targetX += paddingX;
    targetY += paddingY;
    targetWidth -= paddingX * 2;
    targetHeight -= paddingY * 2;
  }

  const sourceRect = asset.sourceRect ?? {
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
  const sourceAspect = sourceRect.width / sourceRect.height;
  const boxAspect = targetWidth / targetHeight;
  const drawWidth = sourceAspect > boxAspect ? targetWidth : targetHeight * sourceAspect;
  const drawHeight = sourceAspect > boxAspect ? targetWidth / sourceAspect : targetHeight;
  const drawX = targetX + (targetWidth - drawWidth) / 2;
  const drawY = targetY + (targetHeight - drawHeight) / 2;

  ctx.drawImage(
    image,
    sourceRect.x,
    sourceRect.y,
    sourceRect.width,
    sourceRect.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  return true;
}

function createTextTexture(text, fontSize, color, fontWeight = '500') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
  const width = ctx.measureText(text).width + 8;
  const height = fontSize * 1.4;
  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);
  ctx.font = `${fontWeight} ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return { texture, width, height };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCardBadge(ctx, card, x, y, size) {
  const badgePalette = {
    UR: { fill: '#ffffff', stroke: '#0f6cbd' },
    MR: { fill: '#0a7cc1', stroke: '#63c5ff' },
    TYP: { fill: '#ffffff', stroke: '#d1d5db' },
    C1: { fill: '#ffffff', stroke: '#d1d5db' },
    Bilt: { fill: '#111111', stroke: '#6b7280' },
    MB: { fill: '#7a284b', stroke: '#f5d0fe' },
  };
  const palette = badgePalette[card.id] ?? { fill: 'rgba(255,255,255,0.08)', stroke: card.color };

  drawRoundedRect(ctx, x, y, size, size, size * 0.28);
  ctx.fillStyle = palette.fill;
  ctx.strokeStyle = palette.stroke;
  ctx.lineWidth = Math.max(1.1, size * 0.075);
  ctx.fill();
  ctx.stroke();

  const centerX = x + size / 2;
  const centerY = y + size / 2;

  switch (card.id) {
    case 'UR': {
      ctx.fillStyle = '#117aca';
      ctx.save();
      ctx.translate(centerX, centerY);
      const ringOuter = size * 0.27;
      const ringInner = size * 0.115;
      for (let index = 0; index < 4; index += 1) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(-ringOuter, -ringInner);
        ctx.lineTo(-ringInner, -ringOuter);
        ctx.lineTo(ringOuter, -ringInner);
        ctx.lineTo(ringInner, ringOuter);
        ctx.lineTo(-ringOuter, ringInner);
        ctx.closePath();
        ctx.scale(0.5, 0.5);
        ctx.fill();
        ctx.scale(2, 2);
      }
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - size * 0.08, centerY - size * 0.08, size * 0.16, size * 0.16);
      break;
    }
    case 'MR': {
      const innerX = x + size * 0.12;
      const innerY = y + size * 0.15;
      const innerW = size * 0.76;
      const innerH = size * 0.7;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.04;
      drawRoundedRect(ctx, innerX, innerY, innerW, innerH, size * 0.05);
      ctx.stroke();
      drawRoundedRect(ctx, innerX + size * 0.05, innerY + size * 0.05, innerW - size * 0.1, innerH - size * 0.1, size * 0.04);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${size * 0.14}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AMERICAN', centerX, centerY - size * 0.08);
      ctx.fillText('EXPRESS', centerX, centerY + size * 0.12);
      break;
    }
    case 'TYP': {
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = size * 0.07;
      ctx.beginPath();
      ctx.arc(centerX, y + size * 0.46, size * 0.24, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.fillStyle = '#1d4ed8';
      ctx.font = `700 ${size * 0.24}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('citi', centerX, y + size * 0.6);
      break;
    }
    case 'C1': {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = size * 0.075;
      ctx.beginPath();
      ctx.ellipse(centerX + size * 0.02, y + size * 0.36, size * 0.25, size * 0.11, -0.22, Math.PI * 1.08, Math.PI * 1.93);
      ctx.stroke();
      ctx.fillStyle = '#1e3a8a';
      ctx.font = `700 ${size * 0.16}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Capital', centerX, y + size * 0.56);
      ctx.font = `700 ${size * 0.18}px Inter, sans-serif`;
      ctx.fillText('One', centerX, y + size * 0.73);
      break;
    }
    case 'Bilt': {
      ctx.fillStyle = '#111111';
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = size * 0.07;
      drawRoundedRect(ctx, x + size * 0.18, y + size * 0.22, size * 0.64, size * 0.56, size * 0.14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${size * 0.24}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BILT', centerX, centerY + size * 0.01);
      break;
    }
    case 'MB': {
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${size * 0.44}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', centerX, centerY + size * 0.06);
      break;
    }
    default: {
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${size * 0.3}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.shortName.slice(0, 2).toUpperCase(), centerX, centerY);
    }
  }
}

function createCardLabelTexture(card, fontSize, mobile = false) {
  const text = card.shortName;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const logoAsset = CARD_LOGO_ASSETS[card.id] ?? null;
  const badgeSize = mobile ? 20 : 24;
  const logoWidth = logoAsset ? (mobile ? Math.round(logoAsset.width * 0.85) : logoAsset.width) : badgeSize;
  const logoHeight = logoAsset ? (mobile ? Math.round(logoAsset.height * 0.85) : logoAsset.height) : badgeSize;
  const gap = mobile ? 6 : 9;
  const horizontalPadding = mobile ? 8 : 10;
  const verticalPadding = mobile ? 4 : 5;

  ctx.font = `700 ${fontSize}px Inter, sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const mediaWidth = logoAsset ? logoWidth : badgeSize;
  const mediaHeight = logoAsset ? logoHeight : badgeSize;
  const width = horizontalPadding * 2 + mediaWidth + gap + textWidth;
  const height = Math.max(mediaHeight, fontSize * 1.35, badgeSize) + verticalPadding * 2;

  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);

  const texture = new THREE.CanvasTexture(canvas);
  const drawLabel = () => {
    ctx.clearRect(0, 0, width, height);
    drawRoundedRect(ctx, 0.5, 0.5, width - 1, height - 1, height / 2);
    ctx.fillStyle = 'rgba(8, 12, 28, 0.9)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    if (logoAsset) {
      const logoImage = getCardLogoImage(card.id);
      const logoX = horizontalPadding;
      const logoY = (height - logoHeight) / 2;

      if (!drawAssetLogo(ctx, logoImage, logoAsset, logoX, logoY, logoWidth, logoHeight)) {
        drawCardBadge(ctx, card, horizontalPadding, (height - badgeSize) / 2, badgeSize);
      }
    } else {
      drawCardBadge(ctx, card, horizontalPadding, (height - badgeSize) / 2, badgeSize);
    }

    ctx.font = `700 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(text, horizontalPadding + mediaWidth + gap, height / 2);
    texture.needsUpdate = true;
  };

  const logoImage = logoAsset ? getCardLogoImage(card.id) : null;
  if (logoImage && !logoImage.complete) {
    logoImage.addEventListener('load', drawLabel, { once: true });
    logoImage.addEventListener('error', drawLabel, { once: true });
  }

  drawLabel();

  return { texture, width, height };
}

function disposeMaterial(material) {
  if (!material) {
    return;
  }

  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  if (material.map) {
    material.map.dispose();
  }

  material.dispose();
}

function disposeObject(object) {
  if (object.geometry) {
    object.geometry.dispose();
  }

  disposeMaterial(object.material);
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    disposeObject(child);
  }
}

function buildConnectionIndex(transfers) {
  const index = new Map();

  transfers.forEach(([from, to, ratio], connectionIndex) => {
    const connection = { from, to, ratio, index: connectionIndex };

    if (!index.has(from)) {
      index.set(from, []);
    }
    if (!index.has(to)) {
      index.set(to, []);
    }

    index.get(from).push(connection);
    index.get(to).push(connection);
  });

  return index;
}

function clearScene() {
  clearGroup(nodeGroup);
  clearGroup(edgeGroup);
  clearGroup(labelGroup);

  if (state.particleSystem) {
    scene.remove(state.particleSystem);
    state.particleGeo.dispose();
    state.particleMat.dispose();
  }

  state.nodeMeshes = {};
  state.nodeData = {};
  state.labelSprites = {};
  state.glowMeshes = {};
  state.edgeMeshes = [];
  state.edgeDataMap = [];
  state.meshIds = new Map();
  state.nodePositions = {};
  state.currentConnectionsByNode = new Map();
  state.highlightedIds = null;
  state.particleSystem = null;
  state.particleGeo = null;
  state.particleMat = null;
  state.particlePositions = null;
  state.particleProgress = null;
  state.particleSpeeds = null;
  state.particleEdgeIndex = null;
  state.particleCount = 0;
  state.hoveredNode = null;
  state.lockedNode = null;
  state.selectedGroup = null;
  refs.tooltip.style.display = 'none';
}

function visibleCardsForMode(mode) {
  return mode === 'airlines'
    ? CARD_PROGRAMS
    : CARD_PROGRAMS.filter((card) => card.id !== 'MB');
}

function sortDestinations(destinations, groupOrder) {
  return [...destinations].sort((left, right) => {
    const groupDiff = groupOrder.indexOf(left.group) - groupOrder.indexOf(right.group);
    return groupDiff !== 0 ? groupDiff : left.code.localeCompare(right.code);
  });
}

function resetLegendSelection() {
  document.querySelectorAll('.legend-item.clickable').forEach((element) => {
    element.classList.remove('active');
  });
}

function updateStaticCopy() {
  setDocumentMeta({
    title: t('graphDocTitle'),
    description: t('graphMetaDescription'),
  });

  refs.pageTitle.textContent = t('graphHeaderTitle');
  refs.pageSubtitle.innerHTML = t('graphHeaderSubtitle');
  syncLocalizedLinks(refs.titleBar, {
    'redemption-value.html': {},
    'references.html': {},
  });
  refs.controlsHint.innerHTML = t('controlsHint');
  refs.panelTitle.textContent = t('overviewTitle');
  refs.statCardsLabel.textContent = t('cardPrograms');
  refs.statEdgesLabel.textContent = t('transferRelationships');

  document.querySelector('[data-mode="airlines"]').textContent = t('modeAirlines');
  document.querySelector('[data-mode="hotels"]').textContent = t('modeHotels');
}

function buildGraph(mode) {
  clearScene();
  state.currentMode = mode;

  const modeData = getModeData(mode);
  const mobile = isMobile();
  const isAirlines = mode === 'airlines';
  const cards = visibleCardsForMode(mode);
  const sortedDestinations = sortDestinations(modeData.destinations, modeData.groupOrder);

  state.currentGroups = modeData.groups;
  state.currentDestinations = sortedDestinations;
  state.currentTransfers = dedupeTransfers(modeData.transfers);
  state.currentConnectionsByNode = buildConnectionIndex(state.currentTransfers);

  const cardX = -state.width * (mobile ? 0.22 : 0.18);
  const destinationX = state.width * (mobile ? 0.22 : 0.18);
  const cardSpacing = Math.min(
    mobile ? 55 : 80,
    (state.height - (mobile ? 140 : 200)) / Math.max(1, cards.length - 1),
  );
  const cardStartY = ((cards.length - 1) * cardSpacing) / 2;

  cards.forEach((card, cardIndex) => {
    state.nodePositions[card.id] = { x: cardX, y: cardStartY - cardIndex * cardSpacing };
  });

  const maxDestinationSpacing = isAirlines ? (mobile ? 28 : 36) : (mobile ? 45 : 60);
  const destinationSpacing = Math.min(
    maxDestinationSpacing,
    (state.height - (mobile ? 80 : 120)) / Math.max(1, sortedDestinations.length - 1),
  );
  const destinationStartY = ((sortedDestinations.length - 1) * destinationSpacing) / 2;

  sortedDestinations.forEach((destination, destinationIndex) => {
    state.nodePositions[destination.id] = {
      x: destinationX,
      y: destinationStartY - destinationIndex * destinationSpacing,
    };
  });

  const cardRadius = mobile ? 14 : 20;
  const cardGlowRadius = mobile ? 22 : 32;
  const cardFontSize = mobile ? 10 : 13;

  cards.forEach((card) => {
    const position = state.nodePositions[card.id];
    const geometry = new THREE.CircleGeometry(cardRadius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(card.color),
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, 1);
    nodeGroup.add(mesh);
    state.nodeMeshes[card.id] = mesh;
    state.nodeData[card.id] = { type: 'card', data: card };
    state.meshIds.set(mesh.uuid, card.id);

    const glowGeometry = new THREE.CircleGeometry(cardGlowRadius, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(card.color),
      transparent: true,
      opacity: 0.12,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(position.x, position.y, 0);
    nodeGroup.add(glow);
    state.glowMeshes[card.id] = glow;

    const { texture, width, height } = createCardLabelTexture(card, cardFontSize, mobile);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
    );
    sprite.scale.set(width, height, 1);
    sprite.position.set(position.x - cardRadius - 8 - width / 2, position.y, 2);
    labelGroup.add(sprite);
    state.labelSprites[card.id] = sprite;
  });

  const destinationRadius = mobile ? (isAirlines ? 7 : 10) : isAirlines ? 10 : 14;
  const destinationFontSize = mobile ? 8 : 11;
  let lastGroup = null;

  sortedDestinations.forEach((destination) => {
    const groupColor = modeData.groups[destination.group].color;
    const position = state.nodePositions[destination.id];
    const geometry = new THREE.CircleGeometry(destinationRadius, 24);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(groupColor),
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, 1);
    nodeGroup.add(mesh);
    state.nodeMeshes[destination.id] = mesh;
    state.nodeData[destination.id] = { type: 'dest', data: destination };
    state.meshIds.set(mesh.uuid, destination.id);

    const glowGeometry = new THREE.CircleGeometry(destinationRadius + (mobile ? 4 : 6), 24);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(groupColor),
      transparent: true,
      opacity: 0.08,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(position.x, position.y, 0);
    nodeGroup.add(glow);
    state.glowMeshes[destination.id] = glow;

    const labelText = mobile
      ? destination.code
      : `${destination.code}  ${getLocalizedDestinationName(destination, state.language)}`;
    const { texture, width, height } = createTextTexture(
      labelText,
      destinationFontSize,
      mobile ? '#ffffff' : '#dddddd',
      '500',
    );
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
    );
    sprite.scale.set(width, height, 1);
    sprite.position.set(position.x + destinationRadius + 4 + width / 2, position.y, 2);
    labelGroup.add(sprite);
    state.labelSprites[destination.id] = sprite;

    if (destination.group !== lastGroup) {
      const groupInfo = modeData.groups[destination.group];
      const groupLabelSize = mobile ? 7 : 10;
      const { texture: groupTexture, width: groupWidth, height: groupHeight } = createTextTexture(
        getLocalizedGroupName(mode, destination.group, state.language),
        groupLabelSize,
        groupInfo.color,
        '600',
      );
      const groupSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: groupTexture,
          transparent: true,
          opacity: 0.6,
          depthTest: false,
        }),
      );
      groupSprite.scale.set(groupWidth, groupHeight, 1);
      groupSprite.position.set(
        destinationX - 30 - groupWidth / 2,
        position.y + destinationSpacing * 0.65,
        2,
      );
      labelGroup.add(groupSprite);
      lastGroup = destination.group;
    }
  });

  state.currentTransfers.forEach(([fromId, toId, ratio]) => {
    const from = state.nodePositions[fromId];
    const to = state.nodePositions[toId];

    if (!from || !to) {
      return;
    }

    const card = CARD_PROGRAMS_BY_ID.get(fromId);
    const color = card ? card.color : '#666';
    const midX = (from.x + to.x) / 2;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(from.x, from.y, 0),
      new THREE.Vector3(midX, (from.y + to.y) / 2, 0),
      new THREE.Vector3(to.x, to.y, 0),
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.08,
    });
    const line = new THREE.Line(geometry, material);
    edgeGroup.add(line);
    state.edgeMeshes.push(line);
    state.edgeDataMap.push({ from: fromId, to: toId, ratio, color });
  });

  state.particleCount = state.currentTransfers.length * 2;
  state.particleGeo = new THREE.BufferGeometry();
  state.particlePositions = new Float32Array(state.particleCount * 3);
  const particleColors = new Float32Array(state.particleCount * 3);
  state.particleProgress = new Float32Array(state.particleCount);
  state.particleSpeeds = new Float32Array(state.particleCount);
  state.particleEdgeIndex = new Int32Array(state.particleCount);

  for (let index = 0; index < state.particleCount; index += 1) {
    const edgeIndex = index % state.currentTransfers.length;
    state.particleEdgeIndex[index] = edgeIndex;
    state.particleProgress[index] = Math.random();
    state.particleSpeeds[index] = 0.001 + Math.random() * 0.002;

    const cardId = state.currentTransfers[edgeIndex][0];
    const card = CARD_PROGRAMS_BY_ID.get(cardId);
    const color = new THREE.Color(card ? card.color : '#ffffff');

    particleColors[index * 3] = color.r;
    particleColors[index * 3 + 1] = color.g;
    particleColors[index * 3 + 2] = color.b;
  }

  state.particleGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(state.particlePositions, 3),
  );
  state.particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  state.particleMat = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthTest: false,
  });
  state.particleSystem = new THREE.Points(state.particleGeo, state.particleMat);
  scene.add(state.particleSystem);

  refs.statCards.textContent = cards.length;
  refs.statDestLabel.textContent = getLocalizedText(modeData.destLabel, state.language);
  refs.statDest.textContent = sortedDestinations.length;
  refs.statEdges.textContent = state.currentTransfers.length;
  refs.statGroupLabel.textContent = getLocalizedText(modeData.groupLabel, state.language);
  refs.statGroups.textContent = Object.keys(modeData.groups).length;

  refs.legend.innerHTML = '';
  Object.entries(modeData.groups).forEach(([name, info]) => {
    refs.legend.innerHTML += `<div class="legend-item clickable" data-group="${name}"><div class="legend-dot" style="background:${info.color}"></div>${getLocalizedText(info.label, state.language)}</div>`;
  });

  refs.legend.querySelectorAll('.legend-item.clickable').forEach((element) => {
    element.addEventListener('click', () => {
      const group = element.dataset.group;
      if (state.selectedGroup === group) {
        clearAllSelection();
        return;
      }

      state.lockedNode = null;
      refs.tooltip.style.display = 'none';
      state.selectedGroup = group;
      resetLegendSelection();
      element.classList.add('active');
      highlightGroup(group);
      syncGraphUrlState();
    });
  });

  setActiveModeButton(mode);
  applyUrlSelection();
}

function getConnectedEdges(nodeId) {
  return state.currentConnectionsByNode.get(nodeId) ?? [];
}

function highlightNode(nodeId) {
  const connected = getConnectedEdges(nodeId);
  const highlightedIds = new Set([nodeId]);

  connected.forEach((connection) => {
    highlightedIds.add(connection.from);
    highlightedIds.add(connection.to);
  });

  state.highlightedIds = highlightedIds;

  state.edgeMeshes.forEach((line, edgeIndex) => {
    const edge = state.edgeDataMap[edgeIndex];
    line.material.opacity = edge.from === nodeId || edge.to === nodeId ? 0.5 : 0.015;
  });

  Object.entries(state.nodeMeshes).forEach(([id, mesh]) => {
    const isHighlighted = highlightedIds.has(id);
    mesh.material.opacity = isHighlighted ? 1.0 : 0.15;

    if (state.labelSprites[id]) {
      state.labelSprites[id].material.opacity = isHighlighted ? 1.0 : 0.2;
    }
    if (state.glowMeshes[id]) {
      state.glowMeshes[id].material.opacity = isHighlighted ? 0.25 : 0.02;
    }
  });
}

function highlightGroup(groupName) {
  const memberIds = state.currentDestinations
    .filter((destination) => destination.group === groupName)
    .map((destination) => destination.id);
  const memberSet = new Set(memberIds);
  const connected = state.currentTransfers
    .map(([from, to], index) => ({ from, to, index }))
    .filter((connection) => memberSet.has(connection.to));
  const highlightedIds = new Set(memberIds);
  const highlightedEdges = new Set(connected.map((connection) => connection.index));

  connected.forEach((connection) => {
    highlightedIds.add(connection.from);
    highlightedIds.add(connection.to);
  });

  state.highlightedIds = highlightedIds;

  state.edgeMeshes.forEach((line, edgeIndex) => {
    line.material.opacity = highlightedEdges.has(edgeIndex) ? 0.4 : 0.012;
  });

  Object.entries(state.nodeMeshes).forEach(([id, mesh]) => {
    const isHighlighted = highlightedIds.has(id);
    mesh.material.opacity = isHighlighted ? 1.0 : 0.1;

    if (state.labelSprites[id]) {
      state.labelSprites[id].material.opacity = isHighlighted ? 1.0 : 0.15;
    }
    if (state.glowMeshes[id]) {
      state.glowMeshes[id].material.opacity = isHighlighted ? 0.2 : 0.01;
    }
  });
}

function resetHighlight() {
  state.highlightedIds = null;

  state.edgeMeshes.forEach((line) => {
    line.material.opacity = 0.08;
  });

  Object.entries(state.nodeMeshes).forEach(([id, mesh]) => {
    const node = state.nodeData[id];
    mesh.material.opacity = node?.type === 'card' ? 0.9 : 0.85;

    if (state.labelSprites[id]) {
      state.labelSprites[id].material.opacity = 1.0;
    }
    if (state.glowMeshes[id]) {
      state.glowMeshes[id].material.opacity = node?.type === 'card' ? 0.12 : 0.08;
    }
  });

  if (state.particleMat) {
    state.particleMat.opacity = 0.6;
  }
}

function clearAllSelection() {
  state.selectedGroup = null;
  state.lockedNode = null;
  state.hoveredNode = null;
  resetLegendSelection();
  resetHighlight();
  refs.tooltip.style.display = 'none';
  syncGraphUrlState();
}

function getClientPositionForNode(nodeId) {
  const position = state.nodePositions[nodeId];
  if (!position) {
    return { x: state.width / 2, y: state.height / 2 };
  }

  const projected = new THREE.Vector3(position.x, position.y, 0).project(camera);
  return {
    x: ((projected.x + 1) / 2) * state.width,
    y: ((-projected.y + 1) / 2) * state.height,
  };
}

function applyUrlSelection() {
  const { group, node } = getGraphUrlState();

  if (node && state.nodeMeshes[node]) {
    state.lockedNode = node;
    state.selectedGroup = null;
    resetLegendSelection();
    highlightNode(node);
    const point = getClientPositionForNode(node);
    showTooltip(node, point.x, point.y);
    syncGraphUrlState();
    return;
  }

  if (group && state.currentGroups[group]) {
    state.selectedGroup = group;
    state.lockedNode = null;
    resetLegendSelection();
    [...refs.legend.querySelectorAll('.legend-item.clickable')].forEach((element) => {
      element.classList.toggle('active', element.dataset.group === group);
    });
    highlightGroup(group);
    syncGraphUrlState();
    return;
  }

  state.selectedGroup = null;
  state.lockedNode = null;
  resetHighlight();
  refs.tooltip.style.display = 'none';
  syncGraphUrlState();
}

function showTooltip(nodeId, clientX, clientY) {
  const node = state.nodeData[nodeId];
  if (!node) {
    return;
  }

  const connected = getConnectedEdges(nodeId);
  let html = '';

  if (node.type === 'card') {
    html += `<div class="tt-title" style="color:${node.data.color}">${getLocalizedText(node.data.fullName, state.language)}</div>`;
    html += `<div class="tt-sub">${t('tooltipCardSub', {
      count: connected.length,
      mode: t(state.currentMode === 'airlines' ? 'airlinesNoun' : 'hotelsNoun'),
    })}</div>`;
    html += '<div class="tt-partners">';

    connected.forEach((connection) => {
      const destination = state.currentDestinations.find((item) => item.id === connection.to);
      if (!destination) {
        return;
      }

      const groupColor = state.currentGroups[destination.group]?.color ?? '#888';
      html += `<span class="tt-tag" style="border-color:${groupColor}40">${destination.code} ${formatRatio(connection.ratio).replaceAll(' ', '')}</span>`;
    });

    html += '</div>';
  } else {
    const destination = node.data;
    const groupColor = state.currentGroups[destination.group]?.color ?? '#888';
    html += `<div class="tt-title" style="color:${groupColor}">${getLocalizedDestinationName(destination, state.language)}</div>`;
    html += `<div class="tt-sub">${t('tooltipDestSub', {
      group: getLocalizedGroupName(state.currentMode, destination.group, state.language),
      count: connected.length,
    })}</div>`;
    html += '<div class="tt-partners">';

    connected.forEach((connection) => {
      const card = CARD_PROGRAMS_BY_ID.get(connection.from);
      if (!card) {
        return;
      }

      html += `<span class="tt-tag" style="border-color:${card.color}40;color:${card.color}">${card.shortName} ${formatRatio(connection.ratio).replaceAll(' ', '')}</span>`;
    });

    html += '</div>';
  }

  refs.tooltip.innerHTML = html;
  refs.tooltip.classList.toggle('locked', Boolean(state.lockedNode));
  refs.tooltip.style.display = 'block';

  const tooltipWidth = refs.tooltip.offsetWidth;
  const tooltipHeight = refs.tooltip.offsetHeight;
  const mobile = isMobile();
  let tooltipX;
  let tooltipY;

  if (mobile) {
    tooltipX = Math.max(8, Math.min(state.width - tooltipWidth - 8, clientX - tooltipWidth / 2));
    tooltipY = clientY > state.height / 2 ? clientY - tooltipHeight - 24 : clientY + 24;
    tooltipY = Math.max(8, Math.min(state.height - tooltipHeight - 8, tooltipY));
  } else {
    tooltipX = clientX + 16;
    tooltipY = clientY - tooltipHeight / 2;

    if (tooltipX + tooltipWidth > state.width - 20) {
      tooltipX = clientX - tooltipWidth - 16;
    }
    if (tooltipY < 10) {
      tooltipY = 10;
    }
    if (tooltipY + tooltipHeight > state.height - 10) {
      tooltipY = state.height - tooltipHeight - 10;
    }
  }

  refs.tooltip.style.left = `${tooltipX}px`;
  refs.tooltip.style.top = `${tooltipY}px`;
}

function updateCamera() {
  const halfWidth = state.width / (2 * state.zoomLevel);
  const halfHeight = state.height / (2 * state.zoomLevel);
  camera.left = -halfWidth + state.panOffset.x;
  camera.right = halfWidth + state.panOffset.x;
  camera.top = halfHeight + state.panOffset.y;
  camera.bottom = -halfHeight + state.panOffset.y;
  camera.updateProjectionMatrix();
}

function getIntersectedNode(eventX, eventY) {
  mouse.x = (eventX / state.width) * 2 - 1;
  mouse.y = -(eventY / state.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(state.nodeMeshes));

  if (!intersects.length) {
    return null;
  }

  return state.meshIds.get(intersects[0].object.uuid) ?? null;
}

renderer.domElement.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();
    state.zoomLevel = Math.max(0.3, Math.min(3, state.zoomLevel * (event.deltaY > 0 ? 0.92 : 1.08)));
    updateCamera();
  },
  { passive: false },
);

renderer.domElement.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    state.isPanning = true;
    state.panStart = { x: event.clientX, y: event.clientY };
  }
});

renderer.domElement.addEventListener('mousemove', (event) => {
  if (state.isPanning) {
    state.panOffset.x -= (event.clientX - state.panStart.x) / state.zoomLevel;
    state.panOffset.y += (event.clientY - state.panStart.y) / state.zoomLevel;
    state.panStart = { x: event.clientX, y: event.clientY };
    updateCamera();
    return;
  }

  const foundId = getIntersectedNode(event.clientX, event.clientY);

  if (foundId) {
    if (foundId !== state.hoveredNode) {
      state.hoveredNode = foundId;
      if (!state.lockedNode && !state.selectedGroup) {
        highlightNode(foundId);
        showTooltip(foundId, event.clientX, event.clientY);
      }
    } else if (!state.lockedNode && !state.selectedGroup) {
      showTooltip(foundId, event.clientX, event.clientY);
    }

    renderer.domElement.style.cursor = 'pointer';
    return;
  }

  if (state.hoveredNode && !state.lockedNode && !state.selectedGroup) {
    state.hoveredNode = null;
    resetHighlight();
    refs.tooltip.style.display = 'none';
  }

  renderer.domElement.style.cursor = 'default';
});

renderer.domElement.addEventListener('mouseup', () => {
  state.isPanning = false;
});

renderer.domElement.addEventListener('click', (event) => {
  if (state.hoveredNode) {
    if (state.selectedGroup) {
      state.selectedGroup = null;
      resetLegendSelection();
    }

    if (state.lockedNode === state.hoveredNode) {
      state.lockedNode = null;
      resetHighlight();
      refs.tooltip.style.display = 'none';
    } else {
      state.lockedNode = state.hoveredNode;
      highlightNode(state.hoveredNode);
      showTooltip(state.hoveredNode, event.clientX, event.clientY);
    }

    syncGraphUrlState();
    return;
  }

  if (state.lockedNode || state.selectedGroup) {
    clearAllSelection();
  }
});

let touchStartDistance = 0;
let touchStartZoom = 1;
let isTouchPanning = false;
let touchPanStart = { x: 0, y: 0 };

renderer.domElement.addEventListener(
  'touchstart',
  (event) => {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      isTouchPanning = true;
      touchPanStart = { x: touch.clientX, y: touch.clientY };

      const foundId = getIntersectedNode(touch.clientX, touch.clientY);
      if (foundId) {
        state.hoveredNode = foundId;

        if (state.selectedGroup) {
          state.selectedGroup = null;
          resetLegendSelection();
        }

        if (state.lockedNode === foundId) {
          state.lockedNode = null;
          resetHighlight();
          refs.tooltip.style.display = 'none';
        } else {
          state.lockedNode = foundId;
          highlightNode(foundId);
          showTooltip(foundId, touch.clientX, touch.clientY);
        }

        syncGraphUrlState();
        isTouchPanning = false;
      } else if (state.lockedNode || state.selectedGroup) {
        clearAllSelection();
        isTouchPanning = false;
      }

      return;
    }

    if (event.touches.length === 2) {
      isTouchPanning = false;
      const deltaX = event.touches[0].clientX - event.touches[1].clientX;
      const deltaY = event.touches[0].clientY - event.touches[1].clientY;
      touchStartDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      touchStartZoom = state.zoomLevel;
    }
  },
  { passive: false },
);

renderer.domElement.addEventListener(
  'touchmove',
  (event) => {
    event.preventDefault();

    if (event.touches.length === 1 && isTouchPanning) {
      const touch = event.touches[0];
      state.panOffset.x -= (touch.clientX - touchPanStart.x) / state.zoomLevel;
      state.panOffset.y += (touch.clientY - touchPanStart.y) / state.zoomLevel;
      touchPanStart = { x: touch.clientX, y: touch.clientY };
      updateCamera();
      return;
    }

    if (event.touches.length === 2) {
      const deltaX = event.touches[0].clientX - event.touches[1].clientX;
      const deltaY = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      state.zoomLevel = Math.max(0.3, Math.min(3, touchStartZoom * (distance / touchStartDistance)));
      updateCamera();
    }
  },
  { passive: false },
);

renderer.domElement.addEventListener('touchend', () => {
  isTouchPanning = false;
});

document.querySelectorAll('.mode-btn').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.mode === state.currentMode) {
      return;
    }

    state.panOffset = { x: 0, y: 0 };
    state.zoomLevel = 1;
    updateCamera();
    updateUrlParams({ mode: button.dataset.mode, group: null, node: null, lang: state.language });
    buildGraph(button.dataset.mode);
  });
});

window.addEventListener('resize', () => {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  renderer.setSize(state.width, state.height);
  state.panOffset = { x: 0, y: 0 };
  state.zoomLevel = 1;
  updateCamera();
  buildGraph(state.currentMode);
});

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  if (state.particleSystem && state.particleGeo) {
    for (let index = 0; index < state.particleCount; index += 1) {
      state.particleProgress[index] += state.particleSpeeds[index];

      if (state.particleProgress[index] > 1) {
        state.particleProgress[index] -= 1;
      }

      const edgeIndex = state.particleEdgeIndex[index];
      if (edgeIndex >= state.currentTransfers.length) {
        continue;
      }

      const [fromId, toId] = state.currentTransfers[edgeIndex];
      const from = state.nodePositions[fromId];
      const to = state.nodePositions[toId];

      if (!from || !to) {
        continue;
      }

      const progress = state.particleProgress[index];
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      state.particlePositions[index * 3] =
        (1 - progress) * (1 - progress) * from.x +
        2 * (1 - progress) * progress * midX +
        progress * progress * to.x;
      state.particlePositions[index * 3 + 1] =
        (1 - progress) * (1 - progress) * from.y +
        2 * (1 - progress) * progress * midY +
        progress * progress * to.y;
      state.particlePositions[index * 3 + 2] = 0.5;
    }

    state.particleGeo.attributes.position.needsUpdate = true;
  }

  CARD_PROGRAMS.forEach((card, cardIndex) => {
    const glow = state.glowMeshes[card.id];
    if (!glow) {
      return;
    }

    const isHighlighted = state.highlightedIds ? state.highlightedIds.has(card.id) : false;
    const baseOpacity = state.highlightedIds
      ? isHighlighted
        ? 0.25
        : 0.02
      : 0.12;

    glow.material.opacity = baseOpacity + Math.sin(time * 1.5 + cardIndex) * 0.03;
    glow.scale.setScalar(1 + Math.sin(time * 1.2 + cardIndex * 0.5) * 0.05);
  });

  renderer.render(scene, camera);
}

buildGraph(getGraphUrlState().mode);
updateCamera();
animate();

bindLanguageToggle();
updateStaticCopy();
onLanguageChange(
  (language) => {
    state.language = language;
    updateStaticCopy();
    buildGraph(state.currentMode);
  },
  { immediate: false },
);

setTimeout(() => refs.titleBar.classList.add('faded'), 3000);
refs.titleBar.addEventListener('mouseenter', () => refs.titleBar.classList.remove('faded'));
refs.titleBar.addEventListener('mouseleave', () => refs.titleBar.classList.add('faded'));
