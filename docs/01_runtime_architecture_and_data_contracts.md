# 01 Runtime Architecture And Data Contracts

## Runtime Approach

The MVP should be a static-friendly frontend app:

- client-side React application
- file-based content for restaurant data
- no server or database in the first release
- deployable to GitHub Pages or similar static hosting

## Core Modules

- `src/app/`: app shell and top-level state flow
- `src/features/restaurants/types.ts`: restaurant domain types
- `src/features/restaurants/`: restaurant data loading and filtering
- `src/features/destiny/types.ts`: destiny card domain types
- `src/features/destiny/`: destiny card definitions and draw logic
- `src/features/spin/`: slot-machine reveal flow
- `src/features/result/`: expedition result presentation
- `src/components/`: shared UI components
- `data/restaurants.json`: editable restaurant source data

## State Model

MVP state should track:

- active category
- available restaurants
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

- `startExpedition(category)` to draw a destiny card and destination together
- `useExpedition(category)` to manage `idle -> revealing -> spinning -> result`
- a single reroll path only when the drawn card grants reroll power
- local JSON data under `data/restaurants.json`
