# 💳 信用卡转点二分图

> **在线体验 → [1suponatime.github.io/credit-card-transfer-graph](https://1suponatime.github.io/credit-card-transfer-graph/)**

交互式可视化工具，展示美国主流信用卡积分向航空公司和酒店的转点关系。

## 📄 页面

| 页面 | 说明 |
|------|------|
| [转点二分图](https://1suponatime.github.io/credit-card-transfer-graph/) | Three.js 交互式二分图，支持航空/酒店切换、联盟筛选、拖拽缩放 |
| [兑换价值分析](https://1suponatime.github.io/credit-card-transfer-graph/redemption-value.html) | Portal CPP 对比 + 目标选择器，找出最佳转点路径 |
| [数据来源](https://1suponatime.github.io/credit-card-transfer-graph/references.html) | 所有转点比例、CPP 估值的引用出处 |

## 🏦 覆盖积分计划

Chase UR · Amex MR · Citi TYP · Capital One · Bilt · Marriott Bonvoy

## ✈️ 覆盖航司 & 🏨 酒店

- **航空**: 27 家（Star Alliance / oneworld / SkyTeam / 独立航司）
- **酒店**: 7 家（Hyatt / Hilton / IHG / Marriott / Wyndham / Choice / Accor）

## 📱 特性

- 手机触控适配（单指拖拽 + 双指缩放）
- 深色主题，标签自动缩放
- 点击联盟/酒店集团筛选高亮
- 数据更新至 2026.3

## 🚀 本地运行

```bash
git clone https://github.com/1suponatime/credit-card-transfer-graph.git
cd credit-card-transfer-graph
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 🧩 代码结构

- `index.html`: 图谱页面壳子 + Three.js importmap
- `redemption-value.html`: 兑换价值页面壳子
- `references.html`: 数据来源页
- `js/data.js`: 所有共享数据源（积分计划、航司、酒店、转点关系、分组）
- `js/graph-app.js`: 二分图渲染、交互、动画
- `js/redemption-app.js`: 兑换价值表格与目标选择器逻辑

## 🤝 贡献

发现数据有误或想添加新的积分计划？欢迎 [提交 Issue](https://github.com/1suponatime/credit-card-transfer-graph/issues)！

项目架构详见 [BLUEPRINT.md](./BLUEPRINT.md)。

## 📚 数据来源

- [US Credit Card Guide — 积分点数之翼](https://www.uscreditcardguide.com/wings-of-the-points/)
- [The Points Guy — Monthly Valuations](https://thepointsguy.com/guide/monthly-valuations/)
- [Frequent Miler — Reasonable Redemption Values](https://frequentmiler.com/reasonable-redemption-values/)
- 各银行官方转点页面（详见[数据来源页](https://1suponatime.github.io/credit-card-transfer-graph/references.html)）
