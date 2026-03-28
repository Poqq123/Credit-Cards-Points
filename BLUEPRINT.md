# BLUEPRINT - Credit Card Transfer Graph

[English](./BLUEPRINT.md) | [简体中文](./BLUEPRINT.zh-CN.md)

> This document describes the full project design so an AI or developer can reproduce the complete feature set in one pass.

---

## 1. Project Overview

Three fully static HTML pages plus two native ES modules, with zero build dependencies, ready to deploy directly to GitHub Pages:

| File | Purpose | Core Tech |
|------|---------|-----------|
| `index.html` | Shell for the interactive transfer graph | HTML + import map |
| `redemption-value.html` | Shell for the redemption value analysis page | HTML |
| `references.html` | Sources and citations | Plain HTML/CSS |
| `js/data.js` | Shared data source | Native ES module |
| `js/graph-app.js` | Graph rendering and interactions | Three.js |
| `js/redemption-app.js` | Redemption-value logic | Native JS DOM rendering |

**External dependencies**: Three.js v0.163.0 (CDN), Google Fonts Inter

### 1.1 Architecture Principles

- Single source of truth: all rewards programs, partners, and transfer ratios live in `js/data.js`
- Split page logic: the graph page and redemption-value page each use their own module
- Keep the zero-build setup: use browser-native ES modules, no bundler

---

## 2. Data Model

### 2.1 Rewards Programs (left-side nodes)

```js
CARD_PROGRAMS = [
  {
    id: 'UR',           // unique identifier
    name: 'Chase UR',   // display name
    fullName: 'Chase Ultimate Rewards',
    color: '#3b82f6',   // node color
  },
  // Total of 6: UR, MR, TYP, C1, Bilt, MB
]
```

**Current rewards programs and colors**:

| ID | Name | Color |
|----|------|------|
| `UR` | Chase Ultimate Rewards | `#3b82f6` |
| `MR` | Amex Membership Rewards | `#10b981` |
| `TYP` | Citi ThankYou Points | `#6366f1` |
| `C1` | Capital One Miles | `#ef4444` |
| `Bilt` | Bilt Rewards | `#f59e0b` |
| `MB` | Marriott Bonvoy | `#ec4899` |

### 2.2 Destinations (right-side nodes)

These are split into two groups and toggled by mode:

**Airlines** (`AIRLINES`): 27 total

```js
{
  id: 'AC',
  name: 'Air Canada',
  code: 'AC',                 // IATA code, mobile only shows this field
  alliance: 'Star Alliance',  // used for grouped coloring
}
```

**Alliance colors**:

| Alliance | Color |
|----------|------|
| Star Alliance | `#fbbf24` |
| oneworld | `#f87171` |
| SkyTeam | `#60a5fa` |
| Independent | `#a78bfa` |

**Hotels** (`HOTELS`): 7 total, grouped as Luxury / Mid-Scale / Economy

### 2.3 Transfer Relationships (edges)

```js
AIRLINE_TRANSFERS = [
  ['UR', 'AC', 1],      // [program ID, destination ID, transfer ratio]
  ['MR', 'NH', 0.5],    // non-1:1 ratio
  ['C1', 'JL', 0.75],
  ['MB', 'AA', 0.42],   // Marriott 3:1.25 ~= 0.42
  // ...
]
```

**Ratio notes**: most values are `1` (1:1). Special cases:

- MR -> ANA: `0.5` (2:1)
- MR -> Cathay: `0.8`
- MR -> JetBlue: `0.8`
- MR -> Hilton: `2` (1:2 bonus)
- C1 -> JAL: `0.75`
- MB -> most airlines: `0.42` (3:1.25)
- MB -> United: `0.37`
- TYP/C1 -> Accor: `0.5`
- Bilt -> Accor: `0.67`

---

## 3. Transfer Graph (`index.html`) - Core Architecture

### 3.1 Three.js Scene

```text
OrthographicCamera
├── Left column: rewards-program nodes (CircleGeometry + glow)
├── Right column: destination nodes (CircleGeometry + glow)
├── Edges (BufferGeometry LINE)
├── Text labels (Sprite + canvas texture)
└── Background particles (Points, 200 total)
```

**Camera**: `OrthographicCamera(-W/2, W/2, H/2, -H/2)`, controlled through `panOffset` and `zoomLevel`.

### 3.2 Layout Algorithm

```text
isMobile = viewport width < 640px

Left column X = -viewW * 0.32
Right column X = +viewW * 0.32

Left nodes are vertically distributed with spacing = viewH / (cardCount + 1)
Right nodes are vertically distributed with spacing = viewH / (destCount + 1)

Node radius: desktop 10px, mobile 6px
Label font size: desktop 13px (cards) / 11px (destinations), mobile 10px / 8px
```

### 3.3 Text Rendering

Uses a `Canvas 2D -> Texture -> Sprite` approach:

```js
function createTextTexture(text, fontSize, color, weight) {
  // 1. Create an offscreen canvas
  // 2. ctx.font = `${weight} ${fontSize}px Inter`
  // 3. Use measureText to get width
  // 4. Canvas size = textWidth x fontSize*1.4
  // 5. Draw centered fillText
  // 6. return { texture, width: canvas.width, height: canvas.height }
}
```

- Rewards-program labels: white (`#ffffff`), weight 700, fixed to the left of each node
- Destination labels: desktop shows `"AC  Air Canada"`, mobile shows only `"AC"`, fixed to the right of each node
- Destination label colors: desktop `#dddddd`, mobile `#ffffff`

### 3.4 Edges

```js
// Each line = independent BufferGeometry + LineBasicMaterial
// Color: the rewards-program color, opacity 0.15
// Non-1:1 transfers: add a ratio text label at the midpoint
```

### 3.5 Interaction State Machine

```text
State: { hoveredNode, lockedNode, selectedAlliance }

Mouse/Touch -> Raycast -> node hit detection:
  - hover: highlight the node + connected edges + connected nodes
  - click/tap: lock or unlock the node and show the tooltip
  - click alliance legend: highlight all nodes and edges in that alliance
  - click empty space: clear all selection

Highlight behavior:
  - Related nodes: opacity 1.0, scale 1.2
  - Related edges: opacity 0.6
  - Unrelated: opacity 0.08 (nodes), 0.02 (edges)
  - Glow: shown for related nodes, colored by node color, scale = 2x node size
```

### 3.6 Tooltip

```text
Position: follows mouse/touch, with overflow avoidance near screen edges
Content:
  - Rewards-program node: display name + transfer-partner count + all destination chips (code + ratio)
  - Destination node: display name + alliance + number of supported programs + all program chips
Chip: <span> tag with alliance/program-colored border
```

### 3.7 Pan and Zoom

```js
// Mouse: mousedown -> drag -> mousemove updates panOffset, mousewheel updates zoomLevel
// Touch: one-finger drag for pan, two-finger pinch for zoom

// Important: "grab-drag" behavior (content follows finger)
panOffset.x -= deltaClientX / zoomLevel;
panOffset.y += deltaClientY / zoomLevel;

function updateCamera() {
  const hw = W / (2 * zoomLevel), hh = H / (2 * zoomLevel);
  camera.left = -hw + panOffset.x;
  camera.right = hw + panOffset.x;
  camera.top = hh + panOffset.y;
  camera.bottom = -hh + panOffset.y;
  camera.updateProjectionMatrix();
}
```

### 3.8 Window Resize

```js
// Listen for resize -> update W, H -> renderer.setSize -> updateCamera
// Re-run buildGraph(currentMode) to rebuild layout
```

---

## 4. UI Layout

```text
┌──────────────────────────────────────────────────────────┐
│ [Title Bar - top left]  Credit Card Transfer Partners   │
│  by 1suponatime · ... · Redemption Value · References   │
│                                                          │
│ [Legend - below title]                                   │
│ ● Star Alliance  ● oneworld  ● SkyTeam  ● Independent   │
│                                             [Mode Toggle]│
│                                             Airline Hotel│
│                                                          │
│             ┌─── Three.js Canvas ───┐                    │
│             │   Left        Right    │                    │
│             │ Rewards     Airlines/  │                    │
│             │ Programs      Hotels   │                    │
│             │  -----edges-----       │                    │
│             └───────────────────────┘                    │
│                                                          │
│ [Controls - bottom left]     [Info Panel - bottom right] │
│ Hover to highlight           Overview                    │
│ Click to lock                6 programs / 27 airlines    │
│ Scroll to zoom               ...                         │
│ Drag to pan                                               │
└──────────────────────────────────────────────────────────┘
```

### Mobile (<=640px) Differences

- Title bar: 14px `h1`, 11px subtitle
- Mode toggle: moves to the bottom-right corner at `bottom: 12px; right: 12px`
- Legend: `top: 38px; left: 8px`, smaller font
- Controls hint and info panel: `display: none`
- Destination labels: show only the IATA code, not the full name
- Smaller node radius and label font size

---

## 5. Redemption Value Analysis (`redemption-value.html`)

### 5.1 Portal CPP Comparison Table

```text
Table headers: rewards program | annual fee | portal flight CPP | portal hotel CPP | earn rate | average transfer CPP | effective return
Data source: CARDS array with portal.flights, portal.hotels, earn rates, effectiveReturn
Highlight: highest CPP gets a green background (.cpp-best)
```

### 5.2 Destination Selector

```text
Tab switch: airlines / hotels
Grid layout for destination choices, grouped by alliance
Selecting a destination calculates all transferable programs:
  effectiveCpp = avgCpp x transferRatio
  value100k = effectiveCpp x 100000 / 100
Sorted results render transfer cards, with the best option marked as recommended
```

### 5.3 Mobile

- `dest-grid`: 2 columns
- `transfer-cards`: 1 column
- Smaller overall padding and fonts

---

## 6. References (`references.html`)

11 numbered references, including:

- US Credit Card Guide Wings of the Points (primary data source)
- Official bank transfer pages (Chase, Amex, Citi, Capital One, Bilt, Marriott)
- CPP valuation sources (TPG, NerdWallet, Frequent Miler)
- Quick-reference table for non-1:1 ratios
- Update log

---

## 7. Visual Design System

### Colors

```css
--bg: #0a0a1a          /* deep-space background */
--surface: rgba(18,18,38,0.9)
--border: rgba(255,255,255,0.06)
--text: #e0e0e0
--dim: #666
```

The background layers three `radial-gradient` effects (blue / purple / green) to create a subtle glow.

### Typography

`Inter` (Google Fonts), weights 300-800

### Panel Styling

`background: rgba(15,15,35,0.75)` + `backdrop-filter: blur(12px)` + `border-radius: 12px` + `1px solid rgba(255,255,255,0.06)`

### Motion

- Node hover: scale 1.2, duration 0.2s
- Highlight and dim states: direct `mesh.material.opacity` changes
- Glow: semi-transparent circle, scale = 2x node size

---

## 8. Deployment

```bash
# Local development
python3 -m http.server 8080

# Push to GitHub Pages
gh auth switch -u 1suponatime
git add -A && git commit -m "msg" && git push origin main
gh auth switch -u GindaChen

# GitHub Pages settings
# Source: main branch, / (root)
# Build type: legacy
# URL: https://1suponatime.github.io/credit-card-transfer-graph/
```

---

## 9. Data Update Guide

1. Update the `CARD_PROGRAMS` / `AIRLINES` / `HOTELS` / `*_TRANSFERS` arrays.
2. Update the corresponding `CARDS` / `AIRLINES` / `HOTELS` / `*_TRANSFERS` in `redemption-value.html`.
3. Update the date and citations in `references.html`.
4. Primary data source: [uscreditcardguide.com/wings-of-the-points/](https://www.uscreditcardguide.com/wings-of-the-points/)
