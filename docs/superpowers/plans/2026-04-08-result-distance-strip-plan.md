# Result Distance Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在翻牌結果下方新增按需定位的距離資訊列，並以現有 `lat / lng` 顯示遠征地與玩家的大約直線距離。

**Architecture:** 保持現有 `city / district` location-aware 流程不變，新增一層 session-only 的 browser geolocation hook 來取得玩家座標，並在結果 UI 下方渲染輕量距離 strip。距離運算以純函式封裝，UI 只吃狀態與文案。

**Tech Stack:** React, TypeScript, Vitest, Testing Library, browser geolocation API

---

### Task 1: Add failing distance tests

**Files:**
- Create: `src/test/distance-utils.test.ts`
- Modify: `src/test/expedition-flow.test.tsx`

- [ ] **Step 1: Write the failing utility test**

```ts
import { describe, expect, test } from 'vitest';
import { calculateDistanceMeters, formatDistanceLabel } from '../features/location/distance';

describe('distance helpers', () => {
  test('formats short and long straight-line distance labels', () => {
    expect(formatDistanceLabel(450)).toBe('遠征地距離你約 450 公尺');
    expect(formatDistanceLabel(1200)).toBe('遠征地距離你約 1.2 公里');
  });

  test('calculates a positive straight-line distance from two coordinates', () => {
    const meters = calculateDistanceMeters(
      { lat: 25.047, lng: 121.531 },
      { lat: 25.052, lng: 121.544 },
    );

    expect(meters).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Write the failing result-flow test**

```ts
test('reveals a distance strip after a user grants geolocation', async () => {
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 25.047,
            longitude: 121.531,
          },
        });
      }),
    },
  });

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  await screen.findByText('今日遠征地', {}, { timeout: 4000 });
  fireEvent.click(screen.getByRole('button', { name: '啟用定位後可顯示遠征地距離' }));

  expect(await screen.findByText(/遠征地距離你約/)).toBeInTheDocument();
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/test/distance-utils.test.ts src/test/expedition-flow.test.tsx`
Expected: FAIL because distance helpers / distance strip do not exist yet.

### Task 2: Implement distance helpers and hook

**Files:**
- Create: `src/features/location/distance.ts`
- Create: `src/features/location/use-destination-distance.ts`

- [ ] **Step 1: Write the minimal distance helpers**

```ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export function calculateDistanceMeters(origin: Coordinates, target: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(target.lat - origin.lat);
  const deltaLng = toRadians(target.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const targetLat = toRadians(target.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceLabel(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `遠征地距離你約 ${Math.round(distanceMeters)} 公尺`;
  }

  return `遠征地距離你約 ${(distanceMeters / 1000).toFixed(1)} 公里`;
}
```

- [ ] **Step 2: Write the minimal geolocation hook**

```ts
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
} as const;
```

The hook should:
- keep a session-only cached user coordinate
- request geolocation only when `requestDistance()` is called
- derive `idle / requesting / ready / unsupported` display states
- recalculate distance automatically when destination changes and user coordinates are already cached

- [ ] **Step 3: Run the targeted tests**

Run: `npm test -- src/test/distance-utils.test.ts src/test/expedition-flow.test.tsx`
Expected: PASS

### Task 3: Render the distance strip in result UI

**Files:**
- Create: `src/components/distance-strip.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add the distance strip component**

The component should support:
- `idle` clickable button copy
- `requesting` plain text copy
- `ready` plain text copy

- [ ] **Step 2: Wire it into the result layout**

Render order:
- card
- distance strip
- action buttons

- [ ] **Step 3: Style it as a light support row**

The strip should:
- stay outside the card
- sit above the action buttons
- use a lighter support treatment than the CTA buttons
- remain readable on mobile

- [ ] **Step 4: Run affected tests**

Run: `npm test -- src/test/expedition-flow.test.tsx src/test/app-shell.test.tsx`
Expected: PASS

### Task 4: Sync docs and full verification

**Files:**
- Modify: `docs/00_product_principles_and_scope.md`
- Modify: `docs/01_system_architecture_and_data_model.md`
- Modify: `docs/02_mvp_experience_and_gameplay_spec.md`
- Modify: `docs/03_qa_release_and_doc_governance.md`

- [ ] **Step 1: Update SSOT**

Add:
- result-stage distance strip behavior
- explicit user-triggered geolocation rule
- distance formatting copy
- QA checks for distance strip and non-blocking geolocation

- [ ] **Step 2: Run full verification**

Run:
- `npm test`
- `npm run build`
- `npm run build:pages`

Expected:
- all tests pass
- builds succeed

- [ ] **Step 3: Commit and push**

```bash
git add src docs
git commit -m "Add expedition distance strip"
git push origin codex/initial-mvp
```
