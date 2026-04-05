# 今天吃什麼

`今天吃什麼` 是一個奇幻冒險風的命運拉霸機，幫一群人用最少討論、最多氣氛的方式，快速決定今天要吃哪裡。

## Current Scope

First release targets a no-login, same-screen MVP:

- category switcher for lunch, dinner, drinks, and sweets
- one-tap "today's expedition" flow
- staged destiny-card reveal
- slot-style destination animation
- direct Google Maps launch
- one guaranteed reroll every round
- `宿命重骰` can grant one extra reroll
- lightweight content and docs sync inside this repo

## Getting Started

```bash
npm install
npm run data:import
npm run dev
```

## Verification

```bash
npm test
npm run build
```

## Repo Layout

- `docs/`: active product and engineering docs
- `docs/superpowers/specs/`: approved design specs
- `docs/superpowers/plans/`: implementation plans
- `data/`: editable restaurant content
- `src/`: frontend app source
- `public/`: static assets

## Status

The repository now includes:

- fantasy expedition app shell
- full imported restaurant snapshot from the reference public sheets
- destiny card filtering with fallback behavior
- staged expedition reveal flow
- one guaranteed reroll every round
- bonus reroll when luck grants `宿命重骰`
- illustrated destiny cards with game-style presentation
