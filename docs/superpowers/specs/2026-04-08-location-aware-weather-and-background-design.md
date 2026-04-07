# Location-Aware Weather And Background Design

## Goal

讓首頁天氣與背景都跟著 `目前遠征地` 走，而不是繼續固定在臺北市中山區。

## Approved Behavior

- 首頁天氣資料改為依 `currentLocation.city + currentLocation.district` 決定
- 若該行政區有對應的 CWA 鄉鎮 3 小時天氣預報 mapping，直接載入該區官方資料
- 若該行政區暫時沒有 CWA mapping，退回本地 fallback weather snapshot
- 首頁僅顯示簡短來源標示 `3 小時天氣預報`
- 不在 UI 上額外顯示 `中央氣象署` 或行政區來源說明

## Background Rules

- 背景優先使用 `目前遠征地` 對應行政區的正式圖
- 若該行政區在 `images/backgrounds/<city>/<district>/` 尚無正式圖，回退到 `images/backgrounds/shared/`
- 若餐廳資料中沒有該行政區，manual chooser 本來就不應讓使用者切換到該地區

## Scope

### This round

- location-aware weather lookup
- UI 顯示 `3 小時天氣預報`
- weather hook 跟 currentLocation 同步
- docs / tests / deployment sync

### Not this round

- geolocation
- IP fallback
- 非餐廳資料來源的城市 / 行政區 chooser
- 新的 district 背景素材產製
