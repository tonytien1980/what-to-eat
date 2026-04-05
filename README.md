# 今天吃什麼

`今天吃什麼` 是一個奇幻冒險風的命運拉霸機，幫一群人用最少討論、最多氣氛的方式，快速決定今天要吃哪裡。

## Current Scope

First release targets a no-login, same-screen MVP:

- Taipei weather driven by the official CWA 36-hour county forecast
- weather-selected fantasy scene backgrounds
- Google Sheet runtime restaurant loading
- category switcher for lunch, dinner, drinks, and sweets
- no preselected category on first load
- one-tap "today's expedition" flow
- weighted card-back draw on load and reroll
- tall playing-card reveal with cloud-clearing animation
- notice-board category buttons and scroll-style CTA artwork
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
npm run build:pages
```

## GitHub Pages

- pushes to `codex/initial-mvp` now trigger automatic GitHub Pages deployment
- the workflow uses `npm run build:pages` with a relative asset base so the site works under the Pages subpath

## Repo Layout

- `docs/`: active product and engineering docs
- `docs/superpowers/specs/`: approved design specs
- `docs/superpowers/plans/`: implementation plans
- `data/`: editable restaurant content
- `data/restaurant-sheet-sources.json`: published Google Sheet source list
- `images/`: project artwork assets used by the game-like UI
- `src/`: frontend app source
- `public/`: static assets

## Status

The repository now includes:

- fantasy expedition app shell
- bundled fallback snapshot refreshed from your published Google Sheet
- runtime sheet sources switched to the owner's published Google Sheet
- runtime Google Sheet loading with bundled fallback snapshot
- Taipei weather scene selection via official CWA county forecast data
- destiny card filtering with fallback behavior
- simplified altar header with fixed two-line title
- transparent altar stage so the card stands on the scene instead of a dark panel
- one guaranteed reroll every round
- bonus reroll when luck grants `宿命重骰`
- weighted fantasy card backs with rarity glow tiers
- single source list for published restaurant sheets
- tall reveal card with detached action buttons
- rarity-matched front face templates from `images/faces/`
