# Credit Card Transfer Graph

[English](./README.md) | [简体中文](./README.zh-CN.md)

> **Live Demo -> [TobeAdded](https://)**

An interactive visualization of transfer relationships between major US credit card rewards programs and airline or hotel loyalty partners.

## Pages

| Page | Description |
|------|-------------|
| [Transfer Graph](https://1suponatime.github.io/credit-card-transfer-graph/) | Interactive Three.js bipartite graph with airline or hotel switching, alliance filters, drag, and zoom |
| [Redemption Value Analysis](https://1suponatime.github.io/credit-card-transfer-graph/redemption-value.html) | Portal CPP comparison and destination selector to find stronger transfer options |
| [References](https://1suponatime.github.io/credit-card-transfer-graph/references.html) | Source list for transfer ratios and CPP valuations |

## Rewards Programs Covered

Chase UR · Amex MR · Citi TYP · Capital One · Bilt · Marriott Bonvoy

## Airlines and Hotels Covered

- **Airlines**: 27 programs across Star Alliance, oneworld, SkyTeam, and independent carriers
- **Hotels**: 7 programs including Hyatt, Hilton, IHG, Marriott, Wyndham, Choice, and Accor

## Features

- Mobile touch support with single-finger drag and two-finger zoom
- Dark theme with responsive label scaling
- Alliance and hotel-group filters with focused highlighting
- Data updated through March 2026

## Run Locally

```bash
git clone https://github.com/Poqq123/Credit-Cards-Points.git
cd Credit-Cards-Points
python3 -m http.server 8080
# Open http://localhost:8080
```

## Project Structure

- `index.html`: shell for the graph page and Three.js import map
- `redemption-value.html`: shell for the redemption value page
- `references.html`: source reference page
- `js/data.js`: shared data for rewards programs, airline partners, hotel partners, transfer links, and grouping
- `js/graph-app.js`: graph rendering, interaction, and animation logic
- `js/redemption-app.js`: redemption table and destination selector logic

## Contributing

Found incorrect data or want to add another rewards program? Open an [Issue](https://github.com/Poqq123/Credit-Cards-Points/issues).

See [BLUEPRINT.md](./BLUEPRINT.md) for project architecture details.

## Data Sources

- [US Credit Card Guide - Wings of the Points](https://www.uscreditcardguide.com/wings-of-the-points/)
- [The Points Guy - Monthly Valuations](https://thepointsguy.com/guide/monthly-valuations/)
- [Frequent Miler - Reasonable Redemption Values](https://frequentmiler.com/reasonable-redemption-values/)
- Official bank transfer-partner pages, summarized in the [References page](https://1suponatime.github.io/credit-card-transfer-graph/references.html)
