# 01 Runtime Architecture And Data Contracts

## Runtime Approach

The MVP should be a static-friendly frontend app:

- client-side React application
- Google Sheet runtime fetch for restaurant data
- no server or database in the first release
- deployable to GitHub Pages or similar static hosting

## Core Modules

- `src/app/`: app shell and top-level state flow
- `src/features/weather/`: official CWA Zhongshan District town-forecast loading, normalization, and scene mapping
- `src/features/card-backs/`: weighted back deck definitions and rarity styling metadata
- `src/features/restaurants/types.ts`: restaurant domain types
- `src/features/restaurants/data.ts`: fallback snapshot and sheet-source configuration
- `src/features/restaurants/google-sheet-loader.ts`: published-sheet CSV parsing and normalization
- `src/features/restaurants/use-restaurant-catalog.ts`: runtime catalog loading and fallback state
- `src/features/restaurants/`: restaurant filtering
- `src/features/destiny/types.ts`: destiny card domain types
- `src/features/destiny/`: destiny card definitions and draw logic
- `src/features/spin/`: slot-machine reveal flow
- `src/features/result/`: expedition result presentation
- `src/components/`: shared UI components
- `data/restaurants.json`: bundled fallback restaurant snapshot
- `data/restaurant-sheet-sources.json`: published Google Sheet source list
- `images/`: local image assets committed with the repo

## State Model

MVP state should track:

- active category
- available restaurants
- current weighted card back
- current rarity-matched card face template
- current destiny card
- selected destination
- reroll availability
- reroll-consumed status

## Restaurant Contract

Each restaurant record should support future filterable randomness:

```json
{
  "id": "beef-noodle-01",
  "name": "老街牛肉麵",
  "category": "lunch",
  "mapUrl": "https://maps.app.goo.gl/example",
  "tags": ["noodle", "hot", "soup"],
  "priceLevel": "medium",
  "distanceLevel": "near",
  "isEnabled": true
}
```

## Restaurant Catalog Result Contract

```json
{
  "restaurants": [],
  "status": "live",
  "sourceLabel": "Google Sheet 即時資料"
}
```

- `live`: runtime data fetched successfully from the published sheets
- `fallback`: runtime fetch failed, using bundled snapshot
- `loading`: app has fallback data ready and is still trying to refresh from Google Sheet

## Destiny Card Contract

Each destiny card should declare both presentation and behavior:

```json
{
  "id": "swift-wind",
  "name": "疾風祝福",
  "type": "filter",
  "description": "只從近距離據點中抽取今日遠征地。",
  "filter": {
    "distanceLevel": ["near"]
  },
  "allowReroll": false
}
```

## Filtering Rule

Filtering should follow this order:

1. category
2. enabled flag
3. destiny-card filter
4. fallback to category-only pool if filter result is empty

This keeps randomness fun without causing dead-end rounds.

## Current Runtime Note

The current implementation uses:

- `startExpedition(category, restaurants, cardBack)` to bind one weighted card back to each round
- `useExpedition(category, restaurants)` to manage `idle -> revealing -> spinning -> result`
- `activeCategory = null` as the first-load idle state so the user must choose a type before starting
- one guaranteed reroll every round
- one optional bonus reroll if the expedition first reveals `宿命重骰`
- weighted card-back selection on initial page load and every reroll
- rarity-matched face templates under `images/faces/`
- runtime Google Sheet data as the primary restaurant source
- local fallback JSON under `data/restaurants.json`
- `data/restaurant-sheet-sources.json` as the single editable list of sheet URLs
- `npm run data:import` to refresh the fallback snapshot from the current published sheets
- `npm run build:pages` now builds with a relative asset base for GitHub Pages hosting
- `https://www.cwa.gov.tw/Data/js/3hr/ChartData_3hr_T_63.js` as the browser-loaded Zhongshan District 3-hour source
- `https://www.cwa.gov.tw/Data/js/GT/ChartData_GT24hr_T_63.js` as the browser-loaded Zhongshan District temperature / feels-like source
- town id `6300400` as the fixed Zhongshan District weather source
- scene selection now supports reload-time rotation across compatible fantasy scenes for the same weather variant
