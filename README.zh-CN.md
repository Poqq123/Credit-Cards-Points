# 信用卡转点二分图

[English](./README.md) | [简体中文](./README.zh-CN.md)

> **在线体验 -> [credit-cards-points.vercel.app](https://credit-cards-points.vercel.app/)**

这是一个交互式可视化工具，用来展示美国主流信用卡积分计划与航司、酒店常旅客计划之间的转点关系。

## 页面说明

| 页面 | 说明 |
|------|------|
| [转点二分图](https://credit-cards-points.vercel.app/) | 基于 Three.js 的交互式二分图，支持航空与酒店切换、联盟筛选、拖拽和缩放 |
| [兑换价值分析](https://credit-cards-points.vercel.app/redemption-value.html) | 提供 Portal CPP 对比和目标选择器，帮助寻找更优转点路径 |
| [数据来源](https://credit-cards-points.vercel.app/references.html) | 汇总所有转点比例和 CPP 估值的引用出处 |

## 覆盖的积分计划

Chase UR · Amex MR · Citi TYP · Capital One · Bilt · Marriott Bonvoy

## 覆盖的航司与酒店

- **航空**：27 家，涵盖星空联盟、寰宇一家、天合联盟和独立航司
- **酒店**：7 家，包括 Hyatt、Hilton、IHG、Marriott、Wyndham、Choice 和 Accor

## 功能特性

- 支持手机触控，单指拖拽、双指缩放
- 深色主题，标签会根据视图自动缩放
- 支持按联盟和酒店集团筛选并高亮显示
- 数据更新至 2026 年 3 月

## 本地运行

```bash
git clone https://github.com/Poqq123/Credit-Cards-Points.git
cd Credit-Cards-Points
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 项目结构

- `index.html`：图谱主页外壳与 Three.js import map
- `redemption-value.html`：兑换价值分析页外壳
- `references.html`：数据来源页面
- `js/data.js`：共享数据源，包含积分计划、航司、酒店、转点关系和分组信息
- `js/graph-app.js`：二分图渲染、交互和动画逻辑
- `js/redemption-app.js`：兑换价值表格与目标选择器逻辑

## 参与贡献

如果你发现数据有误，或者想补充新的积分计划，欢迎提交 [Issue](https://github.com/Poqq123/Credit-Cards-Points/issues)。

项目架构说明请见 [BLUEPRINT.zh-CN.md](./BLUEPRINT.zh-CN.md)。

## 数据来源

- [US Credit Card Guide - 积分点数之翼](https://www.uscreditcardguide.com/wings-of-the-points/)
- [The Points Guy - Monthly Valuations](https://thepointsguy.com/guide/monthly-valuations/)
- [Frequent Miler - Reasonable Redemption Values](https://frequentmiler.com/reasonable-redemption-values/)
- 各银行官方转点页面，整理见[数据来源页](https://credit-cards-points.vercel.app/references.html)
