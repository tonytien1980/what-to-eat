# 今天吃什麼

`今天吃什麼` 是一個奇幻冒險風的命運拉霸機，幫一群人用最少討論、最多氣氛的方式，快速決定今天要吃哪裡。

## Current Scope

First release targets a no-login, same-screen MVP:

- Taipei's 12 districts mapped to official timestamped CWA town forecasts
- honest unavailable/stale weather states; no fabricated thunderstorm fallback
- weather-selected fantasy scene backgrounds with reload-time scene rotation
- Google Sheet runtime restaurant loading
- category switcher for lunch, dinner, drinks, and sweets
- no preselected category on first load
- phase-1 location-aware restaurant routing with `city / district`
- Zhongshan default location anchor with local remembered override
- lightweight `更改預計冒險地` sheet without a blocking setup gate
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
- district weather and backgrounds via official CWA town forecast data
- strict district filtering when selected, strict city filtering when city-only
- destiny card filtering with fallback behavior
- simplified altar header with fixed two-line title
- transparent altar stage so the card stands on the scene instead of a dark panel
- one guaranteed reroll every round
- bonus reroll when luck grants `宿命重骰`
- weighted fantasy card backs with rarity glow tiers
- single source list for published restaurant sheets
- tall reveal card with detached action buttons
- rarity-matched front face templates from `images/faces/`

## Batch-One Repair Status

The 2026-09-23 weather repair is implemented on `codex/batch-one-data-safety`, not yet deployed.
Forecast temperature and apparent temperature share the same timestamp. The UI distinguishes
the forecast time and the following 24-hour range from current observations and today's range.
Initial failure has no invented values; refresh failure preserves only the same district's last-good data with a stale label.
The Apps Script atomic publishing design was approved on 2026-09-24 and is implemented locally.
It validates the complete master schema, asks for confirmation, rechecks inputs under a script lock,
replaces four tabs in one Sheets v4 batch, and verifies all values before reporting success.
The CLI preview shares the actual `Code.gs` contract instead of a separate validator.
The production publisher and production sheets remain unchanged. On 2026-09-24, private test copies
were created and the new script installed with copy-only IDs. Live acceptance is pending Google API
terms confirmation and subsequent authorization, not passed. The copied master also contains 69 enabled
rows without a category; no production data was corrected. See the acceptance checkpoint in
`docs/superpowers/plans/2026-09-23-batch-one-data-safety.md` and `apps-script/master-publish-sync/INSTALL.md`.
