# 03 QA Release And Doc Governance

## 文件角色

本文件定義：

- 目前 MVP 的驗收清單
- 品質檢查項
- 驗證指令
- 發版與文件同步規則

## 文件治理規則

未來只維護以下 4 份正式 SSOT：

- `docs/00_product_principles_and_scope.md`
- `docs/01_system_architecture_and_data_model.md`
- `docs/02_mvp_experience_and_gameplay_spec.md`
- `docs/03_qa_release_and_doc_governance.md`

同步原則：

- 若變更產品本質、範圍或邊界，更新 `00`
- 若變更架構、資料模型、內容模型或啟用順序，更新 `01`
- 若變更玩家可見流程、文案、互動、視覺規則，更新 `02`
- 若變更驗收方式、驗證指令、發版規則或文件治理流程，更新 `03`
- 若某次修改同時影響多層，必須在同一工作階段一起更新

以下 working specs 的正式需求，已吸收進 active 4 份 SSOT：

- `docs/superpowers/specs/2026-04-05-google-sheet-runtime-data-design.md`
- `docs/superpowers/specs/2026-04-06-location-detection-and-fallback-design.md`

未來如果要調整 live data productization 或 location-aware 行為，應直接更新 00-03，而不是只改 working specs。

## MVP Functional Checks

- first load 應顯示未選取 category
- category 切換會改變候選池
- runtime catalog 可優先從 Google Sheet 載入
- 若 Google Sheet 失敗，會回退到 bundled snapshot
- 第一抽前就能看到一張卡背
- card back 稀有度永遠對應 face template 稀有度
- reroll 會同時改變目的地與卡背
- 每次 expedition 都先抽 destiny card
- 卡背會先出現，再顯示正面內容
- 結果一定屬於 active category
- 若過濾後為空，會安全回退
- 結果畫面顯示正確目的地名稱
- `出發去吃` 會開啟正確 map URL
- 每局至少有一條 reroll 路徑
- 特殊 destiny rule 會正確加送 bonus reroll
- 中山區天氣可載入並影響場景選擇
- 若官方天氣資料失敗，fallback weather 仍可顯示
- 重新整理頁面時，同天候可輪替到其他相容場景

## Active Capability Checks: Location-Aware Phase 1

目前 location-aware Phase 1 至少要驗：

- 若沒有 saved location，first paint 使用中山區預設錨點
- 若有 saved location，first paint 直接套用，不重開 chooser
- refresh 不重開 chooser
- 若同時有 `city + district`，優先用 district pool
- district 無結果時，正確回退到 city pool
- city 也無結果時，正確回退到 category 的 enabled pool
- `目前遠征地` 狀態在 UI 上可見
- `更改位置` / `補上地區` 可用
- manual correction 會覆蓋 auto-detected value
- city dropdown 與 district dropdown 關聯正確
- `略過地區` 能成立，且不造成死路
- location-aware 新欄位不破壞命運卡、重抽、地圖跳轉與 GitHub Pages
- Google Sheet runtime 主資料來源在 location-aware 模式下仍可運作
- Google Sheet 失敗時 fallback snapshot 仍可維持 location-aware safe fallback
- Phase 1 不會偷偷啟用 geolocation / IP fallback
- owner sheet 使用 `shop` / `maplink` / `city` / `district` 時，runtime loader 與 `npm run data:import` 都必須正常

## Quality Checks

- Traditional Chinese 文案一致
- mobile viewport 可用
- 大標不溢出
- 分類按鈕與卷軸 CTA 在圖資上仍可辨識
- mobile 上 `先選遠征類型` 不可換行
- 正式背景圖只保留 `webp`
- trial / master / preview 圖不得混入正式 runtime 背景目錄
- 正式網站讀取的 district 背景必須落在 `images/backgrounds/<city>/<district>/`
- 共享 fallback 背景必須落在 `images/backgrounds/shared/`
- 正式背景單張目標大小應落在 `150 KB - 350 KB`
- 正式背景單張不得超過 `500 KB`
- 已核准的 `trial-low` 升階到 `final-medium` 時，不可直接重新 `generate`
- `final-medium` 必須能追溯到對應的 `lock-master` 與 `edit` 升階流程
- 更換圖資後仍符合 safe-frame guide
- disabled 或缺資料狀態可閱讀
- 動畫不阻塞最終結果
- charge-up、flip burst、settle pulse 在手機上仍可用
- `common` 必須明顯弱於 `rare`，不可讀成同一種白光只差亮度
- `rare / epic / legendary` 的 breathing 節奏與強度必須有分級
- `hidden` 仍應維持與一般 rarity 不同的 scan / anomaly 感
- tall reveal card 在 desktop 與 mobile 都能正常解析
- 卡片正面與背面文字在 mobile 縮放後仍可閱讀
- 透明祭壇舞台不應蓋掉背景場景
- 中文 `city / district` 必須能經由背景 manifest 正確對到英文 slug 圖檔
- 同區多景點時，只能從目前天氣有正式圖的景點池中抽圖
- district 級背景缺圖時，fallback 順序必須回退到 `images/backgrounds/shared/` 既有共享奇幻背景
- 同一地標的多天氣正式圖，不可在建築主體上出現明顯漂移
- reduced-motion 使用者仍能完成快速揭示
- build 後本地 snapshot 仍可用
- `npm run data:import` 後 sheet source 與 fallback snapshot 維持一致

## Verification Commands

MVP 必須維持：

- 自動化測試覆蓋資料與選取邏輯
- production build 驗證
- 若有配置 lint / typecheck，則一併驗證

目前指令：

- `npm test`
- `npm run build`
- `npm run build:pages`

## Deployment

- GitHub Pages workflow：`.github/workflows/deploy-pages.yml`
- Pages 應發佈 `dist/` artifact

## Release Rules

未同步更新正式 SSOT 前，不得 stage、commit 或 push 會影響以下內容的修改：

- gameplay rules
- data contracts
- visible UI copy
- setup steps
- release / verification process

## Branch Rules

- 功能實作期間不得直接 push 到 `main`
- 驗證完成後再整理 git state
- 保持 local git state 清楚、可理解
- 本地驗證暫存如 `.playwright-cli/` 與 `output/playwright/` 不應混入正式同步

## 歷史工作文件

- `docs/superpowers/specs/` 與 `docs/superpowers/plans/` 屬於設計 / 規劃工作文件
- 它們不是正式產品 SSOT
- 若與正式 4 份文件有差異，以正式 4 份文件為準
