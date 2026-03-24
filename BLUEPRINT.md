# 🏗️ BLUEPRINT — 信用卡转点二分图

> 本文档描述了项目的完整设计，供 AI 或开发者一次性复现全部功能。

---

## 1. 项目概述

三个纯静态 HTML 页面 + 两个原生 ES Module，零构建依赖，可直接部署到 GitHub Pages：

| 文件 | 功能 | 核心技术 |
|------|------|----------|
| `index.html` | 交互式转点二分图页面壳子 | HTML + importmap |
| `redemption-value.html` | 兑换价值分析页面壳子 | HTML |
| `references.html` | 数据来源 & 引用 | 纯 HTML/CSS |
| `js/data.js` | 共享数据源 | 原生 ES Module |
| `js/graph-app.js` | 图谱渲染与交互 | Three.js |
| `js/redemption-app.js` | 兑换价值逻辑 | 原生 JS DOM 渲染 |

**外部依赖**: Three.js v0.163.0 (CDN), Google Fonts Inter

### 1.1 架构原则

- 单一数据源: 所有积分计划、目标、转点比例统一维护在 `js/data.js`
- 页面逻辑分离: 图谱和兑换价值页分别放在独立模块中
- 保持零构建: 使用浏览器原生 ES Module，不引入 bundler

---

## 2. 数据模型

### 2.1 积分计划（左侧节点）

```js
CARD_PROGRAMS = [
  {
    id: 'UR',           // 唯一标识
    name: 'Chase UR',   // 显示名
    fullName: 'Chase Ultimate Rewards',
    color: '#3b82f6',   // 节点颜色
  },
  // 共 6 个: UR, MR, TYP, C1, Bilt, MB
]
```

**当前积分计划 & 颜色**:
| ID | 名称 | 颜色 |
|----|------|------|
| `UR` | Chase Ultimate Rewards | `#3b82f6` |
| `MR` | Amex Membership Rewards | `#10b981` |
| `TYP` | Citi ThankYou Points | `#6366f1` |
| `C1` | Capital One Miles | `#ef4444` |
| `Bilt` | Bilt Rewards | `#f59e0b` |
| `MB` | Marriott Bonvoy | `#ec4899` |

### 2.2 目标（右侧节点）

分为两组，通过 mode toggle 切换：

**航空公司** (`AIRLINES`): 27 家
```js
{
  id: 'AC',
  name: 'Air Canada (加航)',
  code: 'AC',          // IATA 代码，手机端只显示此字段
  alliance: 'Star Alliance',  // 用于分组着色
}
```

**联盟颜色**:
| 联盟 | 颜色 |
|------|------|
| Star Alliance | `#fbbf24` |
| oneworld | `#f87171` |
| SkyTeam | `#60a5fa` |
| Independent | `#a78bfa` |

**酒店** (`HOTELS`): 7 家，分组为 Luxury / Mid-Scale / Economy

### 2.3 转点关系（边）

```js
AIRLINE_TRANSFERS = [
  ['UR', 'AC', 1],      // [积分计划ID, 目标ID, 转点比例]
  ['MR', 'NH', 0.5],    // 非 1:1 比例
  ['C1', 'JL', 0.75],
  ['MB', 'AA', 0.42],   // Marriott 3:1.25 ≈ 0.42
  // ...
]
```

**比例说明**: 大部分为 `1`（1:1），特殊情况：
- MR → ANA: `0.5`（2:1）
- MR → Cathay: `0.8`
- MR → JetBlue: `0.8`
- MR → Hilton: `2`（1:2 bonus）
- C1 → JAL: `0.75`
- MB → 大部分航司: `0.42`（3:1.25）
- MB → United: `0.37`
- TYP/C1 → Accor: `0.5`
- Bilt → Accor: `0.67`

---

## 3. 转点二分图 (index.html) — 核心架构

### 3.1 Three.js 场景

```
正交相机 (OrthographicCamera)
├── 左列: 积分计划节点 (CircleGeometry + glow)
├── 右列: 目标节点 (CircleGeometry + glow)
├── 连线 (BufferGeometry LINE)
├── 文字标签 (Sprite + Canvas texture)
└── 背景粒子 (Points, 200个)
```

**相机**: `OrthographicCamera(-W/2, W/2, H/2, -H/2)`, 通过 `panOffset` + `zoomLevel` 控制平移缩放。

### 3.2 布局算法

```
isMobile = viewport width < 640px

左列 X = -viewW * 0.32
右列 X = +viewW * 0.32

左列节点垂直均匀分布，间距 = viewH / (cardCount + 1)
右列节点垂直均匀分布，间距 = viewH / (destCount + 1)

节点半径: desktop 10px, mobile 6px
标签字号: desktop 13px(积分) / 11px(目标), mobile 10px / 8px
```

### 3.3 文字渲染

使用 `Canvas 2D → Texture → Sprite` 方案：

```js
function createTextTexture(text, fontSize, color, weight) {
  // 1. 创建 offscreen canvas
  // 2. ctx.font = `${weight} ${fontSize}px Inter`
  // 3. measureText 获取宽度
  // 4. canvas 尺寸 = textWidth × fontSize*1.4
  // 5. fillText 居中绘制
  // 6. return { texture, width: canvas.width, height: canvas.height }
}
```

- 积分计划标签: 白色 (#ffffff), weight 700, 固定在节点左侧
- 目标标签: 桌面显示 `"AC  Air Canada"`, 手机只显示 `"AC"`, 固定在节点右侧
- 目标标签颜色: 桌面 `#dddddd`, 手机 `#ffffff`

### 3.4 连线

```js
// 每条线 = 独立 BufferGeometry + LineBasicMaterial
// 颜色: 积分计划的颜色, 透明度 0.15
// 非 1:1 比例的线: 在中点位置添加比例文字标签
```

### 3.5 交互状态机

```
State: { hoveredNode, lockedNode, selectedAlliance }

Mouse/Touch → Raycast → 检测命中节点:
  - hover: 高亮该节点 + 关联边 + 关联节点
  - click/tap: 锁定/解锁节点, 显示 tooltip
  - 点击联盟图例 → 高亮该联盟所有节点和边
  - 点击空白 → 清除所有选择

高亮逻辑:
  - 关联节点: opacity 1.0, scale 1.2
  - 关联边: opacity 0.6
  - 非关联: opacity 0.08 (节点), 0.02 (边)
  - glow 光晕: 关联节点显示, 颜色=节点颜色, scale=节点2倍
```

### 3.6 Tooltip

```
位置: 跟随鼠标/触摸点, 智能避免超出屏幕边界
内容:
  - 积分计划节点: 显示名 + 转点目标数 + 所有目标 chip (code + ratio)
  - 目标节点: 显示名 + 联盟 + 可转入积分计划数 + 所有积分计划 chip
Chip: <span> 标签, 带联盟/积分计划颜色边框
```

### 3.7 平移 & 缩放

```js
// 鼠标: mousedown → drag → mousemove 更新 panOffset, mousewheel 更新 zoomLevel
// 触控: 单指拖拽 pan, 双指 pinch zoom

// ⚠️ 关键: "抓拖" 模式 (content follows finger):
panOffset.x -= deltaClientX / zoomLevel;  // 注意是减号
panOffset.y += deltaClientY / zoomLevel;  // 注意是加号

function updateCamera() {
  const hw = W / (2 * zoomLevel), hh = H / (2 * zoomLevel);
  camera.left = -hw + panOffset.x;
  camera.right = hw + panOffset.x;
  camera.top = hh + panOffset.y;
  camera.bottom = -hh + panOffset.y;
  camera.updateProjectionMatrix();
}
```

### 3.8 窗口 Resize

```js
// 监听 resize → 更新 W, H → renderer.setSize → updateCamera
// 重新执行 buildGraph(currentMode) 重建布局
```

---

## 4. UI 元素布局

```
┌──────────────────────────────────────────────────────────┐
│ [Title Bar — 左上]  💳 Credit Card Transfer Partners     │
│  by 1suponatime · ... · 💎 兑换价值 · 📚 数据来源       │
│                                                          │
│ [Legend — 左上标题下]                                     │
│ ● Star Alliance  ● oneworld  ● SkyTeam  ● Independent   │
│                                             [Mode Toggle]│
│                                             ✈️航空 🏨酒店 │
│                                                          │
│             ┌─── Three.js Canvas ───┐                    │
│             │   左列        右列     │                    │
│             │  积分计划    航司/酒店  │                    │
│             │  ─────连线─────       │                    │
│             └───────────────────────┘                    │
│                                                          │
│ [Controls — 左下]          [Info Panel — 右下]            │
│ 悬停高亮·点击锁定·         📊 概览                       │
│ 滚轮缩放·拖拽平移          积分计划 6 / 航空 27 / ...    │
└──────────────────────────────────────────────────────────┘
```

### 移动端 (≤640px) 差异

- Title bar: 14px h1, 11px subtitle
- Mode toggle: 移至 **右下角** `bottom:12px; right:12px`
- Legend: `top:38px; left:8px`, 更小字号
- Controls hint + Info panel: `display: none`
- 目标标签: 只显示 IATA code，不显示全名
- 节点半径缩小，标签字号缩小

---

## 5. 兑换价值分析 (redemption-value.html)

### 5.1 Portal CPP 对比表

```
表头: 积分计划 | 年费 | Portal机票CPP | Portal酒店CPP | Earn Rate | 转点均价CPP | 有效回报率
数据源: CARDS 数组, 包含 portal.flights, portal.hotels, earn rates, effectiveReturn
高亮: 最高CPP值加绿色背景 (.cpp-best)
```

### 5.2 目标选择器

```
Tab 切换: ✈️航空公司 / 🏨酒店
Grid 排列目标选项, 按联盟分组
选中目标 → 计算所有可转入的积分计划:
  effectiveCpp = avgCpp × transferRatio
  value100k = effectiveCpp × 100000 / 100
排序后展示 transfer-card, 最优标记 ⭐推荐
```

### 5.3 移动端

- `dest-grid`: 2 列
- `transfer-cards`: 1 列
- 整体 padding/font 缩小

---

## 6. 数据来源 (references.html)

11 条编号引用，包括：
- US Credit Card Guide 积分点数之翼（主数据源）
- 各银行官方转点页面 (Chase, Amex, Citi, C1, Bilt, Marriott)
- CPP 估值来源 (TPG, NerdWallet, FrequentMiler)
- 非 1:1 比例速查表
- 更新日志

---

## 7. 视觉设计系统

### 颜色

```css
--bg: #0a0a1a          /* 深空背景 */
--surface: rgba(18,18,38,0.9)
--border: rgba(255,255,255,0.06)
--text: #e0e0e0
--dim: #666
```

背景叠加三个 `radial-gradient` (蓝/紫/绿) 营造微光效果。

### 字体

`Inter` (Google Fonts), weights 300–800

### 面板样式

`background: rgba(15,15,35,0.75)` + `backdrop-filter: blur(12px)` + `border-radius: 12px` + `1px solid rgba(255,255,255,0.06)`

### 动效

- 节点 hover: scale 1.2, duration 0.2s
- 高亮/暗淡: 通过 mesh.material.opacity 直接修改
- Glow: 半透明圆形, scale = 节点2倍

---

## 8. 部署

```bash
# 本地开发
python3 -m http.server 8080

# 推送到 GitHub Pages
gh auth switch -u 1suponatime
git add -A && git commit -m "msg" && git push origin main
gh auth switch -u GindaChen

# GitHub Pages 配置
# Source: main branch, / (root)
# Build type: legacy
# URL: https://1suponatime.github.io/credit-card-transfer-graph/
```

---

## 9. 更新数据指南

1. 修改 `CARD_PROGRAMS` / `AIRLINES` / `HOTELS` / `*_TRANSFERS` 数组
2. 在 `redemption-value.html` 中同步修改对应的 `CARDS` / `AIRLINES` / `HOTELS` / `*_TRANSFERS`
3. 更新 `references.html` 的日期和引用
4. 数据源: [uscreditcardguide.com/wings-of-the-points/](https://www.uscreditcardguide.com/wings-of-the-points/)
