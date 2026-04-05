# 02 UX Gameplay And Content Spec

## Product Tone

- 奇幻冒險風
- 有儀式感
- 更像桌遊與派對工具，不像老派 RPG 官網
- 保持簡單、快速、直接

## 世界觀轉譯

- 餐廳 -> 據點 / 酒館 / 遠征地
- 抽籤 -> 命運指引
- 拉霸 -> 命運之輪
- 結果 -> 遠征結果
- 重抽 -> 逆天改命

## MVP Screen Flow

### 1. 告示牌首頁

Should include:

- fixed two-line hero title
- Taipei Zhongshan District weather as first-class information
- scene line under the hero title
- two weather info lines under the scene line, using current temperature and feels-like data for Zhongshan District
- visible full-scene background, not faded into the back
- same weather variant may rotate between multiple compatible background scenes on reload
- fantasy-styled category selector using `images/notice/`
- no category selected on first load
- one primary CTA to start the expedition using `images/scrolls/`
- scroll CTA copy should align to the visible parchment window, not the raw image bounds
- one currently selected card back visible before the run begins

### 2. 命運揭示與拉霸

Should include:

- a tall playing-card ratio card
- one weighted random card back chosen on load and reroll
- one rarity-matched face template once the card flips
- rarity glow tied to the current back
- a brief ritual animation on the card back
- one flip transition into the final destination reveal
- a cloud-clearing style reveal once the card face appears

### 3. 遠征結果

Should include:

- selected destination as the dominant card-face content
- no visible destiny-card rules or filter explanation on the card face
- `出發去吃` below the card
- `再抽一次` below the card

## Hidden Destiny Rule

- internal destiny-card rules still control filtering
- those rules are not surfaced as visible card copy in the new card-face UI
- reroll rules still follow the hidden destiny logic behind the scenes

## Reroll Rule

- 每局保底可重選一次
- 若抽到 `宿命重骰`，則額外再送一次
- `再抽一次` 會同時重新抽卡背與目的地
- 使用完後按鈕保留但禁用，明確表示本局容錯已耗盡

## Card Back Rule

- 頁面打開就要先抽到一張卡背
- `再抽一次` 會依同樣權重再抽一張新卡背
- common: 普通白光
- rare: 高強度白光
- epic: 金光
- legendary: 紫光
- hidden: 藍光

## Current Motion Rule

- 第一步先顯示卡背儀式動畫
- 第二步整張牌翻面
- 第三步以撥雲見日的方式揭示餐廳名稱
- 最後才出現卡片下方操作按鈕
- 若使用者偏好 reduced motion，應直接簡化為快速揭曉

## Current Visual Rule

- 卡片要是長條直式撲克牌比例，不是正方卡
- 卡背要直接使用圖檔，不是只用符印佔位
- 正面也要使用對應稀有度的 face 模板，不是單純裸底圖
- 卡片要有深色切邊與陰影，但不能被黑色大色塊包住
- 稀有度光暈必須有明顯區別
- 卡片後方要用透明式光場與稀有度 aura 做分離，而不是深色面板
- 主畫面整體要偏向奇幻桌遊 / 派對遊戲，而不是舊式 RPG 官網
- 場景背景要清楚可見，面板只能局部遮罩，不可整片洗白
- 主標固定兩行，不因螢幕大小而跑版
- 天氣資訊與場景資訊要壓成兩小行，避免 header 太滿

## Success Criteria

- first interaction starts within 30 seconds
- one round resolves within 2 minutes
- users understand the result immediately
- the experience feels more fun than a plain random picker
