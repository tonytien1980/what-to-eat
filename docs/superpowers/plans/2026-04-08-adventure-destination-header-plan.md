# Adventure Destination Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首頁主標下方的位置與預報資訊改成以 `預計冒險地` 為中心的清楚語意。

**Architecture:** 保持既有 `currentLocation` runtime state 不變，只重構首頁上半部呈現層級與文案，使景點 / 天氣摘要、預計冒險地、預報細節各自有明確角色。行為上仍由同一個 location state 控制背景、天氣與資料池。

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

### Task 1: Add failing UI tests

**Files:**
- Modify: `src/test/app-shell.test.tsx`

- [ ] **Step 1: Update title-area expectations**

Add assertions for:
- `預計冒險地：臺北市中山區`
- `更改預計冒險地`
- `預計冒險地 3 小時預報`

- [ ] **Step 2: Assert the scene line no longer includes the city/district prefix**

Expected first scene summary to match `景點 · 天氣` shape, not `臺北市中山區 · 景點 · 天氣`.

- [ ] **Step 3: Run the focused test**

Run: `npm test -- src/test/app-shell.test.tsx`
Expected: FAIL until the UI copy and layout are updated.

### Task 2: Update header and location copy

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/location-status.tsx`
- Modify: `src/components/location-sheet.tsx`
- Modify: `src/features/location/use-location-preference.ts`

- [ ] **Step 1: Change scene summary**

Render only:
- `景點名稱 · 天氣狀態`

- [ ] **Step 2: Change location row copy**

Use:
- `預計冒險地：{location}`
- trigger label `更改預計冒險地`

- [ ] **Step 3: Change forecast label**

Use:
- `預計冒險地 3 小時預報`

- [ ] **Step 4: Update sheet copy**

Use:
- `預計冒險地設定`
- `更改預計冒險地`

### Task 3: Adjust layout and verification

**Files:**
- Modify: `src/styles.css`
- Modify: `docs/00_product_principles_and_scope.md`
- Modify: `docs/02_mvp_experience_and_gameplay_spec.md`
- Modify: `docs/03_qa_release_and_doc_governance.md`

- [ ] **Step 1: Refine spacing between scene summary, planned destination row, and forecast block**

- [ ] **Step 2: Update active SSOT to reflect the new information hierarchy**

- [ ] **Step 3: Run full verification**

Run:
- `npm test`
- `npm run build`
- `npm run build:pages`

- [ ] **Step 4: Commit and push**

```bash
git add src docs
git commit -m "Refine adventure destination header"
git push origin codex/initial-mvp
```
