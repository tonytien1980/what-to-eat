# CWA Town Location Table Design

## Goal

把目前寫死在 weather 程式裡的 `city / district -> countyCode / townId` 對照，抽成正式可維護的管理表。

## Why

- 之後新增城市與行政區，不應再手改 `cwa-county.ts`
- weather 跟目前遠征地連動後，mapping 已成為正式資料契約的一部分
- 需要讓資料、程式與文件都能對同一份 mapping source of truth

## Approved Direction

- 新增正式管理表：`data/cwa-town-locations.json`
- weather runtime 透過專屬 helper 讀取這份表，而不是在 `cwa-county.ts` 內硬寫陣列
- helper 需支援 `台` / `臺` 正規化，避免資料來源混用造成找不到 mapping
- 首輪至少納入目前正式可用的 `臺北市 / 中山區`

## Scope

### This round

- `data/cwa-town-locations.json`
- weather helper 讀取與查找
- 既有 weather 流程改接新 helper
- 測試與 active docs 同步

### Not this round

- 把 mapping 改成 Google Sheet 維護
- 自動生成全台 town mapping
- geolocation / IP fallback
