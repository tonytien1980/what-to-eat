# Google Sheet Runtime Data Design Spec

## Goal

把餐廳資料從「build 前匯入本地 JSON」改成「執行時直接抓公開 Google Sheet」，讓日常更新只需要改試算表內容，不需要每次重新部署網站。

## Product Change

- 餐廳資料在頁面載入後直接抓取公開 Google Sheet CSV
- 維持目前 4 類分類來源：午餐、晚餐、飲料、甜點
- 若執行時抓取失敗，改用 repo 內的快照資料繼續提供玩法
- 首頁要顯示目前資料是 `Google Sheet 即時資料` 還是 `本地快照備援`

## Architecture

- `data/restaurant-sheet-sources.json` 作為單一來源設定檔
- 瀏覽器端以 fetch 讀取每份 published CSV，解析後轉成 `RestaurantRecord`
- `data/restaurants.json` 保留為 fallback snapshot
- `npm run data:import` 仍存在，但用途改成刷新 fallback snapshot，而不是主資料流程

## Acceptance

- Google Sheet 可用時，畫面顯示 `Google Sheet 即時資料`
- Google Sheet 不可用時，畫面仍可正常抽店並顯示 `本地快照備援`
- 不影響既有命運卡、重選、場景和 GitHub Pages
