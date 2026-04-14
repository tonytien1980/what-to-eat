# 2026-04-12 Master Publish Sheet Data Design

## Goal

在不改動前端既有讀取方式的前提下，為 `今天吃什麼` 建立更穩定的資料編輯流程。

核心方向：

- 新增一份獨立的 `master` Google Sheet 作為內部主資料表
- 保留目前前端正在讀取的 `publish` Google Sheet
- 前端仍只讀 `午餐 / 晚餐 / 飲料 / 甜點`
- 同一家店在 `master` 只維護一筆
- 同一家店可依分類布林欄位同步到多個 `publish` tab

## Why

目前 live Google Sheet 同時扮演：

- 編輯中的主資料來源
- 前端直接讀取的發布資料

這種做法在資料量還小時很直覺，但隨著大量連鎖品牌進入後會出現幾個問題：

- 人工整理中的資料會直接影響前端
- 若同一家店同時適合 `午餐` 與 `晚餐`，主表容易重複維護
- 若嘗試再用行政區切 tab，會讓 sheet 數量快速失控

因此本輪的解法不是把 `publish` 再拆更多 tab，而是把：

- `主資料編輯`
- `前端發布`

拆成兩個角色不同的 Google Sheet。

## Core Decision

正式資料架構改為：

1. `Master Sheet`
   - 新增一份獨立 Google Sheet
   - 只保留一張主表：`restaurants_master`
   - 這是唯一真相

2. `Publish Sheet`
   - 沿用目前前端正在讀取的 Google Sheet
   - 保留 4 個 tab：
     - `午餐`
     - `晚餐`
     - `飲料`
     - `甜點`
   - 只作為前端發布資料

## Master Contract

`restaurants_master` 使用最小必要欄位：

- `shop`
- `maplink`
- `city`
- `district`
- `lat`
- `lng`
- `placeid`
- `is_lunch`
- `is_dinner`
- `is_drink`
- `is_sweet`
- `is_enabled`

### Rules

- `shop / maplink / city / district / lat / lng / placeid` 是主資料欄位
- `is_lunch / is_dinner / is_drink / is_sweet` 是發布布林欄位
- `is_enabled` 是總開關
- `master` 中同一實體店家只保留一筆
- 若同一家店同時屬於多個分類，透過多個布林欄位表達，不新增重複列

## Publish Contract

`publish` 的 4 個分類 tab 維持目前正式欄位 contract：

- `shop`
- `maplink`
- `city`
- `district`
- `lat`
- `lng`
- `placeid`

### Rules

- 前端 schema 不變
- `data/restaurant-sheet-sources.json` 不需因本次架構改動而改指向
- runtime loader 與 `npm run data:import` 仍只接受上述 7 欄

## Sync Model

同步採用：

- `半自動同步`

也就是：

1. 由我協助整理與驗證 `master`
2. 使用者確認無誤後，手動按一次「一鍵更新」
3. 同步腳本覆蓋 `publish` 的 4 個 tab

### Sync Direction

只允許：

- `master -> publish`

不允許：

- `publish -> master`

### Sync Rule

每次同步都做整張分類表重建，而不是逐筆 append。

理由：

- 避免舊資料殘留
- 避免重複列
- 避免分類切換後仍殘留過時資料

## Publish Mapping Rule

當 `restaurants_master` 單筆資料符合以下條件時，才允許同步到對應分類表：

- `is_enabled = true`
- 分類欄位為 `true`
- `shop` 有值
- `maplink` 有值
- `city` 有值
- `district` 有值
- `lat` 有值
- `lng` 有值
- `placeid` 有值

### Category Fan-out

例：

- `is_lunch = true`
  - 同步到 `publish.午餐`
- `is_dinner = true`
  - 同步到 `publish.晚餐`
- 若 `is_lunch = true` 且 `is_dinner = true`
  - 同步到兩張分類表

重點：

- `重複只發生在 publish`
- `不發生在 master`

## Sort Rule

`publish` 表同步時固定排序：

1. `city`
2. `district`
3. `shop`

目標是讓同一行政區自然排在一起，但不把行政區升級成 tab 維度。

## Validation Rule

同步前必須先做資料檢查。

v1 rollout 目前實作為：

- 缺 `shop` -> blocking error
- 缺 `maplink` -> blocking error
- 缺 `city` -> warning
- 缺 `district` -> warning
- 缺 `lat` -> warning
- 缺 `lng` -> warning
- 缺 `placeid` -> warning

這樣做的原因是目前 legacy 資料還存在一部分缺 `lat / lng / placeid` 的列，先保持 runtime 相容，不讓首輪 master rollout 被歷史資料直接卡死。

後續資料補齊完成後，才再升級成更嚴格的 hard-block 規則。

## User Workflow

未來實際流程：

1. 使用者或我新增餐廳資料
   - 只改 `master.restaurants_master`

2. 我協助整理與驗證
   - 補 `maplink / lat / lng / placeid`
   - 確認分類布林欄位

3. 使用者按一次「一鍵更新」
   - 由同步腳本重建 `publish` 的 `午餐 / 晚餐 / 飲料 / 甜點`

4. 前端照舊讀 `publish`

## Non-goals

本輪不做：

- 把 `publish` 再按行政區拆成更多 tab
- 讓前端直接讀 `master`
- 新增價格欄位
- 新增是否可內用欄位
- 新增是否可外帶欄位
- 新增營業時間欄位
- 新增行政區排序碼
- 新增推薦權重
- 建立重型 CMS 或後端資料庫

## Why This Design Fits The Product

這個產品的核心仍然是：

- 小玩具
- 快速好玩
- 前端穩定
- 不需要過度複雜的內容管理

所以本設計刻意讓：

- `master` 保留單表與少欄位
- `publish` 保留前端最穩的 4 張分類表
- 使用者操作流程儘量簡單

這是比「全部丟在同一份 live sheet」更穩，又比「做完整資料平台」更輕的中間解。

## Current Rollout Status

目前已完成：

- repo 內已建立可測試的 `master -> publish` sync core
- 已有 `master` bootstrap script，可從目前 publish 資料回填出單表 master rows
- 新的獨立 `master` Google Sheet 已建立並回填完成
- 已有可從 live master 產出 publish preview 的本地指令
- 已有可貼進 Google Apps Script 的一鍵發布腳本

目前尚未完成：

- Apps Script live install 本身仍需進入 Google Sheet 的 script editor 貼上並授權一次

也就是說，這份 spec 的架構方向已經開始落地，但 publish live write 仍屬下一個 rollout。
