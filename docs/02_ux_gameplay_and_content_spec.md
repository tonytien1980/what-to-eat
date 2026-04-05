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

- title and short fantasy tagline
- Taipei weather as first-class information
- restaurant data source status
- visible full-scene background, not faded into the back
- category selector
- one primary CTA to start the expedition
- current readiness hint

### 2. 命運揭示與拉霸

Should include:

- a tarot-style destiny card with a dedicated card back before reveal
- emblem or sigil artwork per card
- accent-tinted frames per card family
- short effect description
- spinning restaurant names
- a dramatic but short stop animation
- a total reveal window that still resolves inside roughly 1.5 seconds

### 3. 遠征結果

Should include:

- selected destination
- destiny card summary
- `出發去吃`
- `逆天改命`
- `返回告示牌`

## Destiny Card Content Rules

- keep total MVP cards under 8
- effect must be understandable in one sentence
- card effects should change filtering or presentation, not require player strategy
- one reroll-enabling card is enough for MVP

## MVP Destiny Card Set

- 疾風祝福: near only
- 黃金匱乏: prefer low price
- 熾焰召喚: hot food focused
- 迷霧籠罩: fully random
- 古神低語: fully random with stronger presentation
- 慶典之日: festive presentation
- 宿命重骰: grants one reroll

## Reroll Rule

- 每局保底可重選一次
- 若抽到 `宿命重骰`，則額外再送一次
- 使用完後按鈕保留但禁用，明確表示本局容錯已耗盡

## Current Motion Rule

- 第一步先顯示命運卡揭示狀態
- 第二步再進入命運之輪輪播
- 最後才出現結果按鈕列
- 若使用者偏好 reduced motion，應直接簡化為快速揭曉

## Current Visual Rule

- 命運卡要像真的抽卡 UI，不是單純文字區塊
- 命運卡揭示階段要先看到卡背，再翻成正面卡面
- 每張卡都要有可辨識圖案或符印
- 每張卡要有自己的色系重點，不能全部長得像同一張卡
- 主畫面整體要偏向奇幻桌遊 / 派對遊戲，而不是舊式 RPG 官網
- 場景背景要清楚可見，面板只能局部遮罩，不可整片洗白
- 天氣資訊、場景名稱、預報時間都要直接看得到
- 餐廳資料目前是即時試算表還是本地備援，要在首頁看得出來

## Success Criteria

- first interaction starts within 30 seconds
- one round resolves within 2 minutes
- users understand the result immediately
- the experience feels more fun than a plain random picker
