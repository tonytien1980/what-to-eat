# 2026-04-08 Restaurant Coordinate Contract Plan

## Goal

完成 owner sheet、runtime loader、fallback snapshot 與 SSOT 的 `lat` / `lng` 升級。

## Steps

1. 從現有 `maplink` 批次解析 45 筆餐廳座標。
2. 以批次寫入把 `lat` / `lng` 回填到 owner Google Sheet 四個分頁。
3. 調整 runtime loader 與 import script，正式支援英文欄位 `shop / maplink / city / district / lat / lng`。
4. 移除舊中文 header 相容，讓資料契約收斂成單一版本。
5. 刷新 `data/restaurants.json`。
6. 更新 active SSOT 與 working docs。
7. 執行測試、build、pages build，確認可發版。
