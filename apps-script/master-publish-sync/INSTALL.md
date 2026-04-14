# Master Publish Sync Apps Script

這份 Apps Script 是給 `今天吃什麼 資料庫` publish sheet 用的手動發布入口。

## 目標

- 你平常編輯 `master` sheet
- 我幫你確認資料沒問題
- 你最後在 publish sheet 按一次選單，就把 `master` 發布到前端正在吃的 `午餐 / 晚餐 / 飲料 / 甜點`

## 已內建的設定

- master spreadsheet id:
  - `11Q8TfeTjvOuDwgX9Ux1kG91pahFcfjC1hA4VO0k4KdM`
- publish spreadsheet id:
  - `1bVR4JtMgJTsDs3qPgPDZexZeOP-0qLhhLolwqDYNt7k`
- master sheet:
  - `restaurants_master`
- publish tabs:
  - `午餐`
  - `晚餐`
  - `飲料`
  - `甜點`

## 安裝步驟

1. 打開 publish sheet：
   - [今天吃什麼 資料庫](https://docs.google.com/spreadsheets/d/1bVR4JtMgJTsDs3qPgPDZexZeOP-0qLhhLolwqDYNt7k/edit)
2. 點 `擴充功能 -> Apps Script`
3. 把預設 `Code.gs` 全部刪掉，改貼這份 repo 裡的：
   - `/Users/oldtien_base/Desktop/今天吃什麼/apps-script/master-publish-sync/Code.gs`
4. 如果專案裡有 `appsscript.json`，也改成這份：
   - `/Users/oldtien_base/Desktop/今天吃什麼/apps-script/master-publish-sync/appsscript.json`
5. 儲存專案
6. 在 Apps Script 先手動執行一次 `publishMasterToRuntime`
7. Google 第一次會要求授權，照畫面授權
8. 回到 publish sheet 重新整理
9. 之後上方會看到新選單：
   - `Master Sync`
10. 正常使用流程：
   - 先按 `預覽同步摘要`
   - 沒問題再按 `發布到前端資料庫`

## 行為規則

- 缺 `shop / maplink` 會阻擋發布
- 缺 `city / district / lat / lng / placeid` 在 v1 只會列 warning，不會阻擋
- 發布時會整張覆蓋 `午餐 / 晚餐 / 飲料 / 甜點`
- publish 仍維持前端正在吃的 7 欄 contract
