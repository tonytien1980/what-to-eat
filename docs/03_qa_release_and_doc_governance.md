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
- 結果階段可顯示距離資訊列
- `出發去吃` 會開啟正確 map URL
- 每局至少有一條 reroll 路徑
- 特殊 destiny rule 會正確加送 bonus reroll
- 臺北市 12 區均能對應正式 CWA townId，並以該區有效預報決定背景
- 若官方天氣資料失敗，不顯示固定假天氣；同區有 last-good 時顯示 stale，否則顯示 unavailable 與共享 default 背景
- 重新整理頁面時，同天候可輪替到其他相容場景
- 首頁需顯示 `預計冒險地 3 小時天氣預報`
- 若遠端版本 manifest 與目前 bundle 的 build id 不同，首頁需顯示 `偵測到新版本，點此更新`

## Active Capability Checks: Location-Aware Phase 1

目前 location-aware Phase 1 至少要驗：

- 若沒有 saved location，first paint 使用中山區預設錨點
- 若有 saved location，first paint 直接套用，不重開 chooser
- refresh 不重開 chooser
- 若同時有 `city + district`，優先用 district pool
- 若同時有 `city + district`，該 district 必須被保留，不可因 fallback snapshot 尚未同步就被洗成 `city-only`
- district 無結果時，該類別應顯示 `可抽 0 家`，不得偷偷回退到 city pool
- 只有在 `district` 留空時，才可使用 city pool
- city 無結果時，CTA 應顯示 `目前沒有可用據點` 並保持禁用
- `預計冒險地` 狀態在 UI 上可見
- `更改預計冒險地` 可用
- scene line 不可再顯示 `城市 / 行政區 · 景點 · 天氣` 三段混合資訊
- manual correction 會覆蓋 auto-detected value
- city dropdown 與 district dropdown 關聯正確
- `略過地區` 能成立，且不造成死路
- location-aware 新欄位不破壞命運卡、重抽、地圖跳轉與 GitHub Pages
- Google Sheet runtime 主資料來源在 location-aware 模式下仍可運作
- Google Sheet 失敗時 fallback snapshot 仍可維持 location-aware safe fallback
- 若目前遠征地有 CWA 鄉鎮 mapping，首頁 weather 必須跟著該行政區切換
- 官方 CWA weather script 不可永久吃同一個固定 URL cache；runtime 應使用時間桶 cache key 避免天氣長時間卡在舊狀態
- 同一個瀏覽器 session 中，頁面回到前景或超過刷新節點後，首頁 weather 必須重新抓取，不可永遠停留在第一次載入的狀態
- weather 測試不可全部 mock 掉 mapping / loader；需驗證真實管理表、script success/error/timeout、同桶重試與 script 清理
- 驗證 Time_3hr 的臺灣時間、跨年、當前時段、未來 24 小時範圍、同筆體感、超過 3 小時來源與缺值拒絕
- 驗證首次失敗、同區刷新失敗、city-only、切區後舊請求晚回，不得出現假溫度或跨區天氣
- 2026-09-23 修復使用獨立分支 `codex/batch-one-data-safety`，測試與 build 不等於已部署；正式站與 Apps Script 啟用仍需另行批准
- `version.json` 必須隨 build 更新，避免手機或 Safari 長時間卡在舊首頁 bundle
- 若目前遠征地無正式背景圖，背景必須回退到 shared，而不是卡死在前一個行政區
- `data/cwa-town-locations.json` 必須能正確把 `city / district` 對到 `countyCode / townId`
- Phase 1 不會偷偷啟用 geolocation / IP fallback
- owner sheet 使用 `shop` / `maplink` / `city` / `district` / `lat` / `lng` / `placeid` 時，runtime loader 與 `npm run data:import` 都必須正常
- `lat` / `lng` 缺值時不能讓 loader crash，應安全落成 `null`
- `placeid` 缺值時不能讓 loader crash，應安全落成 `null`
- `master` sheet 的 `restaurants_master` 表頭必須維持 12 欄：
  `shop / maplink / city / district / lat / lng / placeid / is_lunch / is_dinner / is_drink / is_sweet / is_enabled`
- `master` bootstrap 後，單一店家在 `master` 只能保留一列；午晚餐等跨分類只用布林欄位表達
- master 缺／重複必要表頭、非法或空 flag、整庫空／停用、啟用列缺 shop/maplink 或無分類都需阻擋；單筆缺 city/district/lat/lng/placeid 維持 warning
- 必須測真正 Code.gs：取消、缺目標分頁、確認期間 master/publish 變更、lock 忙碌、批次被拒、已套用但回應遺失、readback 失敗／不符，都不得誤報成功或自動重試
- 必須驗證只提交一次 native batch、保留 H 欄與格式、文字不作公式、增列及四表尾列清除都在同批內
- CLI 與 Apps Script 共用 Code.gs 驗證／投影，CLI fixture 測試不可連線或寫入 Google Sheet
- live runtime 仍只讀 `publish` sheet；`master` 更新不可被誤認成前端已切換資料來源
- 不可在首頁 first load 自動要求 geolocation
- 玩家主動啟用定位後，結果區需顯示 `遠征地距離你約 ...`
- 同一個 session 已取得玩家座標後，reroll 必須可直接重算距離
- refresh 後若本地已有上次成功定位座標，結果區不可退回 `啟用定位後可顯示遠征地距離`
- geolocation 被拒絕時，結果區需顯示可重試的瀏覽器權限提示，而不是模糊的重啟文案

## Quality Checks

- Traditional Chinese 文案一致
- mobile viewport 可用
- 大標不溢出
- 分類按鈕與卷軸 CTA 在圖資上仍可辨識
- `準備好了嗎？` 不可在 desktop 或 mobile 換行
- 距離資訊列在 mobile 上不得壓進卡片或按鈕
- 景點 / 天氣摘要、預計冒險地列、預報標題與預報細節不可出現不同字族、互相打架的色階或失衡的字級
- 正式可被程式抽選與正式同步的背景圖，只能位於 `images/backgrounds/`
- `output/background-trials`、`output/background-finals`、`output/background-runtime` 都是本地工區，不得視為正式上線圖資來源
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
- `npm run master:bootstrap`
- `npm run publish:preview`

master / publish workflow 另需補做的 live checks：

- 確認 `master` sheet 的 `restaurants_master` 可讀且表頭正確
- 確認 bootstrap 後 `master` row count 非 0
- 確認代表性的多分類店家在 `master` 仍維持單列與正確布林欄位
- 確認 `publish:preview` 產出的分類數量合理，且 blocking errors = 0
- 若 `publish:preview` 與目前 publish row count 有差異，需先確認是合理去重或 master 編輯變更，再執行正式發布
- 確認 `publish` sheet 仍可正常被 runtime 與 `npm run data:import` 讀取
- 確認 `data/restaurant-sheet-sources.json` 仍使用 stable published CSV export URL，而不是 `gviz/tq` 變體

Apps Script workflow 補充：

- repo 內的 `apps-script/master-publish-sync/Code.gs` 是使用者手動一鍵發布的正式腳本來源
- 第一次安裝需另行核准，先以測試副本驗收；啟用 Sheets v4 進階服務，執行唯讀 preview 完成授權，不可用 publish 作安裝測試
- 安裝完成後，正式使用路徑為：
  1. `npm run publish:preview`
  2. 在 publish sheet 點 `Master Sync -> 預覽同步摘要`
  3. 確認無 blocking errors 後點 `Master Sync -> 發布到前端資料庫`
  4. 檢視四類筆數增減及清空警告，按確認；取得 lock 後重讀，輸入有變就重來
  5. 只有寫後逐值核對一致才算發布完成；結果未確認時停止重試，依 INSTALL.md 核對與復原

本機 VM 與 fixture 測試不能取代線上服務授權、實際 Sheets API、多人編輯及 CSV 傳播驗證。2026-09-24 已核准測試副本驗收，建立私人 master / publish 副本並安裝僅指向副本的新版腳本。2026-09-25 瀏覽器恢復後，依 owner 批准新增並儲存 Sheets API v4；唯讀 preview 的 Google OAuth 授權遭顯示「系統已封鎖這個應用程式」，已取消等待中的執行。服務設定已確認，但資料驗證、成功／取消發布、防誤清與寫後核對等 live 測項仍未執行，不能標為線上驗收通過；正式環境未更新。後續 OAuth 設定／審核屬另行批准範圍，不得以關閉安全防護或第二條寫入路徑替代。

副本唯讀檢查另發現 69 筆 `is_enabled = TRUE` 但四分類皆未勾選的資料，依既定 contract 會阻擋發布；此為資料檢查結果，不是 Apps Script 已執行的證據。正式分類修正需 owner 決定，不得自動猜測、停用或繞過驗證。副本連結、恢復步驟與待驗項目記錄於 `docs/superpowers/plans/2026-09-23-batch-one-data-safety.md`。

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
