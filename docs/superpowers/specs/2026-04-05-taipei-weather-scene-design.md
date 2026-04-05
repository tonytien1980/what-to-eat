# 台北天氣場景化 Design Spec

## Goal

將 `今天吃什麼：命運遠征` 從單純的奇幻抽餐工具，升級成「由台北市官方天氣預報驅動場景」的遊戲化首頁。

## Product Change

- 預設地區固定為臺北市
- 讀取中央氣象署 36 小時縣市預報
- 依天氣碼自動切換場景與天候 variant
- 背景必須清楚可見，不再做大面積淡化
- 命運卡與抽選區改為祭壇式介面，浮在場景之上

## Data Source

- Official source: `https://www.cwa.gov.tw/Data/js/TableData_36hr_County_C.js`
- City code for Taipei: `63`
- Weather mapping is derived from `images/backgrounds/manifest.json`

## UX Direction

- 主畫面應該像「天氣驅動的異世界據點」
- 天氣是第一層資訊，不是附屬角落資訊
- 場景視覺必須可辨識，不能被過度洗白
- 使用者一打開就能看懂：今天台北天氣如何、現在進入哪個場景、接下來能不能開始抽

## Acceptance

- 打開首頁即可看見對應台北市當前預報的場景
- 場景、天氣描述、溫度、降雨率需同時可見
- 若官方資料載入失敗，仍需有可玩的 fallback 背景與流程
- 抽餐流程與重選流程不可因天氣模組而失效
