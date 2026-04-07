# 2026-04-08 Restaurant Coordinate Contract Design

## Goal

把 owner Google Sheet 的餐廳資料升級成可攜帶正式座標的 contract，作為後續顯示使用者距離的前置基礎。

## Scope

- owner sheet 新增 `lat` / `lng`
- runtime loader 讀取 `lat` / `lng`
- `npm run data:import` 同步把 `lat` / `lng` 寫進 fallback snapshot
- active SSOT 同步更新欄位 contract

## Contract

正式欄位固定為：

- `shop`
- `maplink`
- `city`
- `district`
- `lat`
- `lng`

## Runtime Rule

- `shop` / `maplink` 是必要欄位
- `city` / `district` / `lat` / `lng` 可暫時缺值
- `lat` / `lng` 缺值時，runtime 落成 `null`
- runtime 不再相容舊中文 header

## Why

- Google Maps 短連結可一次性解析成正式座標，但不適合在前端每次即時展開
- 正式把座標存回 owner sheet，可讓前端之後直接計算直線距離
- 把 schema 收斂到單一英文欄位，可降低後續維護與匯入歧義
