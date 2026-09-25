# Master Publish Sync

## 狀態與範圍

2026-09-24 已核准原子批次方案；本分支已完成本機實作，並將僅指向私人測試副本的腳本安裝至副本綁定的 Apps Script。2026-09-25 owner 已同意新增 Sheets API v4 與其服務條款，但瀏覽器頁面控制逾時，尚未由代理按下「新增」，本輪無法重新確認服務狀態；後續帳號授權與線上驗收仍待完成。正式 Apps Script 與正式試算表未修改，未執行線上發布。不要把 GitHub 分支同步當成 Google Sheet 已更新。副本與續接紀錄見 `docs/superpowers/plans/2026-09-23-batch-one-data-safety.md`。

`Code.gs` 是發布、驗證與分類投影的唯一正式實作。本機 `npm run publish:preview` 只讀 master，並透過 Node VM 呼叫同一份 repo 腳本的純函式。CSV 資料不會作為程式執行。前端仍只讀 publish 的四個 CSV，不直接讀 master。

## 安裝與首次驗收

以下是**另外取得線上操作批准後**的步驟：

1. 先在測試用 master / publish 副本上驗收。只在測試用腳本中將兩個 spreadsheet ID 改為副本，不要誤指向正式表。
2. 正式安裝時，從 [publish 試算表](https://docs.google.com/spreadsheets/d/1bVR4JtMgJTsDs3qPgPDZexZeOP-0qLhhLolwqDYNt7k/edit) 開啟「擴充功能 → Apps Script」。
3. 更新 `Code.gs`，並合併本資料夾 `appsscript.json` 的 Sheets v4 進階服務設定；保留線上原有的其他合法設定。
4. 在「服務」中確認 Google Sheets API，識別名稱 `Sheets`、版本 `v4` 已啟用。使用標準 Google Cloud 專案者，還需在該專案啟用 Sheets API；預設專案的服務啟用方式依 [官方說明](https://developers.google.com/apps-script/advanced/sheets)。
5. 首次手動執行 **`previewMasterPublishSync`** 完成必要授權，不能用發布函式作為安裝測試。
6. 重整試算表，確認 `Master Sync` 選單。預覽是唯讀，不會建立、清除或修改分頁。
7. 測試副本需驗證成功、取消、缺表頭、空 master、減少資料、單分類清空及寫後核對，再另外核准正式發布。

內建來源：master `11Q8TfeTjvOuDwgX9Ux1kG91pahFcfjC1hA4VO0k4KdM` 的 `restaurants_master`；publish ID 如上，分頁為 `午餐 / 晚餐 / 飲料 / 甜點`。

## 資料規則

- master 必須包含且不得重複這 12 個表頭：`shop / maplink / city / district / lat / lng / placeid / is_lunch / is_dinner / is_drink / is_sweet / is_enabled`。允許其他備註欄，表頭比對會 trim 與轉小寫。
- 五個 flag 都必須有明確值。接受核取方塊布林、`TRUE/FALSE`、`1/0`、`yes/no`、`y/n`，不接受空白、拼錯或任意非零數字。
- 全空、全停用的 master 阻擋發布。此工具不提供整庫清空功能。
- 啟用列缺 `shop / maplink`，或未選任一分類，會阻擋。
- 保留既有 v1 政策：單筆缺 `city / district / lat / lng / placeid` 是 warning；缺少整個欄位仍是 schema error。
- 某分類合法降為零筆時，確認畫面會明確提示「將清空」；操作者按否或關閉確認視窗都不寫入。
- publish 四表必須都存在且為一般 GRID sheet。A:G 表頭必須是 `shop,maplink,city,district,lat,lng,placeid`；全空分頁可建立表頭，不會自動建立或猜測缺少的分頁。

## 發布流程

1. 讀取 master、四表 metadata 與 A:G 值，驗證全部輸入。
2. 顯示每類發布前／後筆數、淨增減、清空警告與欄位缺漏警告。筆數相同也可能替換內容。
3. 操作者明確確認後才取得 script lock，並重新讀取 master 和四表；確認期間資料或結構有變即中止，要求重看。
4. 僅一次 `Sheets.Spreadsheets.batchUpdate`，包含必要的列／欄擴充與四個 `updateCells`。清除舊尾列和寫入新資料在同一個原子請求內，不再使用 `clearContent()`。
5. 僅更新 A:G 的 `userEnteredValue`，H 欄之後與格式不變；數字使用 `numberValue`，文字使用 `stringValue`，不把等號開頭的店名當成公式。
6. 重新用 Sheets API 讀取四表 A:G，逐值核對目標內容；全部一致才顯示「發布完成」。釋放 lock 後才開結果視窗。

Google 對同一個 [batchUpdate](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate) 提供原子套用；`updateCells` 的 range 與 rows 差額會清除指定欄位，見 [UpdateCellsRequest](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#UpdateCellsRequest)。

## 失敗與回復

- **寫入前阻擋**：顯示「本次未送出寫入」，修正欄位或重新預覽；此執行不會修改資料。
- **取消或 lock 忙碌**：不送出寫入。不要以第二個 Apps Script 專案繞過鎖。
- **送出後發生錯誤／逾時／readback 不符**：顯示「發布結果尚未確認，可能已寫入」。不自動重試、不自動回寫舊值，不宣稱四表仍是舊資料。
- 遇到結果未確認時，先停止其他發布，查看四表與 Google Sheets 版本記錄；重新唯讀預覽、核對預期的 A:G。需要復原時先由資料 owner 確認正確版本，再手動復原，避免覆蓋別人的合法變更。
- 發布期間不要手動編輯 master 或 publish。Script lock 只協調同一 Apps Script 專案的執行，不能鎖住人工編輯；確認後最後一次讀取到提交間仍有人工競態，寫後核對可偵測但不能防止全部競態。
- Sheets 原子寫入不等於 Google CSV 快取同步，也不保證前端四個請求看到同一版本。前端 catalog 交接屬另一批修復。

## 本機驗證

`npm test -- src/test/master-publisher.test.ts src/test/master-publisher-contract.test.ts src/test/publish-preview.test.mjs`

測試執行真正的 `Code.gs`，用假 Google API / UI / lock 做故障注入，另以本機 fixture 測 CLI 匯出，不存取線上資料。這些測試不等於已在 Google Apps Script 真實環境驗證授權與服務設定。

`npm run publish:preview` 是另一次 live master 唯讀抓取；失敗時不可使用之前留下的匯出檔冒充本次結果。有效產物的 `summary.json` 有 `generatedAt`。該 CLI 不會發布到 Google Sheet。
