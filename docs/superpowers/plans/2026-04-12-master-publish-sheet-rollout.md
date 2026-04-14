# Master Publish Sheet Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 `master -> publish` 資料流程，讓新建的 `master` Google Sheet 成為單一主資料來源，同時保留目前前端正在讀取的 `publish` Google Sheet 不變。

**Architecture:** 保持前端 runtime 完全沿用目前 `午餐 / 晚餐 / 飲料 / 甜點` 四張發布表；新增一套 repo 內可測試的同步核心，負責把 `restaurants_master` 單表資料 fan-out 到四張分類表。首輪實作同時包含建立新 `master` sheet 結構、從目前 `publish` 回填初始資料、以及更新文件。為了避免舊資料缺 `lat/lng/placeid` 直接卡死，v1 同步沿用 runtime 的 null-safe 相容，將缺值視為 warning，不先阻斷整批發布。

**Tech Stack:** TypeScript, Vitest, existing Google Sheet CSV contract, Google Drive Sheets connector, Node.js scripts

---

## File Structure

- Create: `docs/superpowers/plans/2026-04-12-master-publish-sheet-rollout.md`
- Create: `src/features/restaurants/master-publish-sync.ts`
- Create: `src/test/master-publish-sync.test.ts`
- Create: `scripts/build-master-sheet-bootstrap.mjs`
- Modify: `docs/superpowers/specs/2026-04-12-master-publish-sheet-data-design.md`
- Modify: `docs/01_system_architecture_and_data_model.md`
- Modify: `docs/03_qa_release_and_doc_governance.md`

## Task 1: Build The Sync Core

**Files:**
- Create: `src/features/restaurants/master-publish-sync.ts`
- Test: `src/test/master-publish-sync.test.ts`

- [ ] **Step 1: Write the failing tests for master row fan-out, dedupe, sort, and validation**

Add tests that cover:

```ts
import {
  buildMasterRowsFromPublishedCategories,
  projectMasterRowsToPublishedCategories,
  validateMasterRowsForPublish,
} from '../features/restaurants/master-publish-sync';

test('merges the same place into one master row and turns category membership into booleans', () => {
  // same place in lunch + dinner -> one master row with two booleans
});

test('fans out one enabled master row into multiple publish categories', () => {
  // is_lunch + is_dinner -> appears in lunch and dinner
});

test('sorts published rows by city, district, and shop', () => {
  // deterministic output ordering
});

test('treats missing lat lng placeid as warnings in v1 instead of hard errors', () => {
  // legacy rows remain publishable for now
});

test('hard-fails rows missing shop or maplink', () => {
  // publish blocker
});
```

- [ ] **Step 2: Run the new test file and verify it fails**

Run:

```bash
npm test -- src/test/master-publish-sync.test.ts
```

Expected:
- `FAIL`
- missing module or missing exported functions

- [ ] **Step 3: Implement the minimal sync core**

Create a focused module that defines:

```ts
export interface MasterRestaurantRow {
  shop: string;
  maplink: string;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  placeid: string | null;
  is_lunch: boolean;
  is_dinner: boolean;
  is_drink: boolean;
  is_sweet: boolean;
  is_enabled: boolean;
}

export interface PublishedRestaurantRow {
  shop: string;
  maplink: string;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  placeid: string | null;
}
```

And functions:

```ts
buildMasterRowsFromPublishedCategories(...)
projectMasterRowsToPublishedCategories(...)
validateMasterRowsForPublish(...)
```

Rules:
- merge duplicates by `placeid` when present
- fallback dedupe key is `shop + city + district + maplink`
- sort publish rows by `city -> district -> shop`
- missing `shop/maplink` = blocking error
- missing `city/district/lat/lng/placeid` = warning only in v1

- [ ] **Step 4: Run the targeted tests and verify they pass**

Run:

```bash
npm test -- src/test/master-publish-sync.test.ts
```

Expected:
- `PASS`

## Task 2: Add A Bootstrap Script For The Master Sheet

**Files:**
- Create: `scripts/build-master-sheet-bootstrap.mjs`
- Modify: `src/features/restaurants/master-publish-sync.ts`
- Test: `src/test/master-publish-sync.test.ts`

- [ ] **Step 1: Write a failing test for building master rows from current publish categories**

Add a fixture-based test proving:

```ts
const master = buildMasterRowsFromPublishedCategories({
  lunch: [...],
  dinner: [...],
  drinks: [...],
  sweets: [...],
});

expect(master).toEqual([
  expect.objectContaining({
    shop: '吉野家(館前店)',
    is_lunch: true,
    is_dinner: false,
  }),
]);
```

- [ ] **Step 2: Run the targeted tests and verify the new case fails first**

Run:

```bash
npm test -- src/test/master-publish-sync.test.ts
```

Expected:
- `FAIL`
- bootstrap behavior not implemented yet

- [ ] **Step 3: Implement the bootstrap script**

Create a Node script that:
- reads `data/restaurants.json`
- groups rows by category
- converts category rows into one `MasterRestaurantRow[]`
- writes the derived JSON to `output/master-sheet-bootstrap/master-rows.json`
- prints a summary

Minimal outline:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { buildMasterRowsFromPublishedCategories } from '../src/features/restaurants/master-publish-sync.ts';
```

- [ ] **Step 4: Run the bootstrap script and verify it produces master rows**

Run:

```bash
node scripts/build-master-sheet-bootstrap.mjs
```

Expected:
- outputs total master row count
- creates `output/master-sheet-bootstrap/master-rows.json`

## Task 3: Create And Initialize The New Master Google Sheet

**Files:**
- Use live spreadsheet: `https://docs.google.com/spreadsheets/d/11Q8TfeTjvOuDwgX9Ux1kG91pahFcfjC1hA4VO0k4KdM/edit?usp=sharing`
- Input data: `output/master-sheet-bootstrap/master-rows.json`

- [ ] **Step 1: Rename the default tab and write the master header**

Target:
- rename `工作表1` -> `restaurants_master`

Header row:

```text
shop, maplink, city, district, lat, lng, placeid, is_lunch, is_dinner, is_drink, is_sweet, is_enabled
```

- [ ] **Step 2: Backfill the new master sheet from current publish data**

Use the bootstrap output to write rows into `restaurants_master`.

Rules:
- one row per place
- category booleans populated
- `is_enabled` defaults to `true`

- [ ] **Step 3: Read back the master sheet and verify counts and header**

Verify:
- tab name is `restaurants_master`
- header matches the expected 12 columns
- row count is non-zero
- duplicated chains like `吉野家` and `すき家` only appear once per real place

## Task 4: Update Docs For The New Workflow

**Files:**
- Modify: `docs/superpowers/specs/2026-04-12-master-publish-sheet-data-design.md`
- Modify: `docs/01_system_architecture_and_data_model.md`
- Modify: `docs/03_qa_release_and_doc_governance.md`

- [ ] **Step 1: Update the design spec to match the v1 null-safe rollout**

Change:
- missing `lat/lng/placeid` from hard publish blocker
- to warning-only in v1 rollout

- [ ] **Step 2: Update active architecture docs**

Document:
- `master sheet` exists as internal source of truth
- `publish sheet` remains the runtime source
- current repo/runtime still reads publish only

- [ ] **Step 3: Update QA/governance docs**

Add:
- master bootstrap verification
- publish sync verification
- explicit note that user-facing runtime stays on publish tabs

## Task 5: Run Full Verification

**Files:**
- Verify existing repo plus new sync code

- [ ] **Step 1: Run targeted sync tests**

Run:

```bash
npm test -- src/test/master-publish-sync.test.ts
```

Expected:
- `PASS`

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected:
- full suite passes

- [ ] **Step 3: Run production builds**

Run:

```bash
npm run build
npm run build:pages
```

Expected:
- both builds pass

- [ ] **Step 4: Re-read the live sheets**

Verify:
- new `master` sheet exists and has correct header
- current `publish` sheet remains readable

## Review Notes

- The original spec assumed hard blocking on missing `lat/lng/placeid`, but the current live dataset still contains legacy null-safe rows. v1 implementation should preserve runtime compatibility and downgrade these checks to warnings until a later cleanup pass.
- A true user-runnable “one-click publish” may require a later credential or Apps Script decision. This rollout still delivers the important first step: `master` sheet architecture, tested sync core, and initialized live master data.
