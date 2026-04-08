# 01 System Architecture And Data Model

## 文件角色

本文件定義：

- 產品的長期系統骨架
- 目前已啟用版本與長期骨架的映射
- 核心資料模型
- 內容治理與命名規則
- 能力啟用順序

本文件是架構與資料層 SSOT。若與 `00_product_principles_and_scope.md` 衝突，以 `00` 為準。

## 架構總原則

- 前台極輕
- 底層完整
- 抽象優先
- 模組分層
- 先留接口，不先堆功能
- 不把未來合作與分析邏輯直接寫死在目前主流程

## 系統分層架構

### 1. Core Decision Engine

負責：

- 定義單次決策流程
- 控制抽選 / 推薦產出
- 管理重抽規則
- 維持核心節奏與公平感

### 2. Content Layer

負責：

- 管理可被抽中的內容項
- 組織不同內容池
- 維持內容資料一致性

### 3. Scenario Layer

負責：

- 定義不同使用場景
- 決定不同場景下可用的內容池、文案與條件修飾

### 4. Theme Layer

負責：

- 視覺皮膚
- 文案語氣
- 演出方式
- 結果呈現模板

### 5. Promotion / Commerce Layer

負責：

- 承載合作內容
- 控制商業內容可見位置與標記方式
- 不干擾核心決策規則

### 6. Analytics Layer

負責：

- 記錄 session
- 記錄結果接受與重抽
- 記錄場景與主題表現

## 目前啟用狀態

### 目前主體

- 目前正式啟用的是 Layer 1 核心體驗
- 並只啟用少量支撐 Layer 1 的 Layer 0 基礎骨架

### 已存在的 Layer 0 基礎

- 穩定 id
- 模組分檔
- 可替換資料來源
- 主題資產配置
- 輕量 modifier 邏輯
- 靜態站可部署架構

### 尚未成為正式 runtime 模組的部分

- 顯式 `Pack` 物件
- 顯式 `Scenario` orchestrator
- Promotion layer
- Session analytics event stream

## 抽象模型與目前 MVP 的映射

- `Choice Item` -> `RestaurantRecord`
- `Pack` -> 尚未成為一級 runtime 物件；目前由 category 候選池、Google Sheet 來源與 fallback snapshot 最小化承接
- `Scenario` -> 目前只有一個共享的單頁「吃什麼」決策場景
- `Theme` -> `今天吃什麼：命運遠征` 的奇幻遠征包裝、天氣場景、卡背與卡面視覺
- `Modifier` -> 系統自帶的天氣情境與 `destiny card` 過濾 / 重抽規則
- `Session` -> `useExpedition` 內的單輪記憶體狀態
- `Promotion Unit` -> 預留，MVP 未啟用

## 目前 runtime approach

MVP 採用靜態友善前端架構：

- client-side React 應用
- Google Sheet runtime fetch 作為主要資料來源
- 無 server
- 無 database
- 可部署到 GitHub Pages 或其他 static hosting

### 已啟用的資料產品化基線

- `data/restaurant-sheet-sources.json` 是公開試算表來源設定檔
- 瀏覽器端直接 fetch published CSV 並轉成 runtime records
- `data/restaurants.json` 保留為 fallback snapshot
- `npm run data:import` 的角色是刷新 fallback snapshot，不是主資料流程
- runtime data source state 屬於正式產品 contract，但是否直接露出在首頁 UI，必須由 `02_mvp_experience_and_gameplay_spec.md` 決定

目前 owner sheet 的欄位 contract 為：

- `shop`
- `maplink`
- `city`
- `district`
- `lat`
- `lng`

正式原則：

- runtime loader 與 `npm run data:import` 只接受上述英文欄位 contract
- `lat` / `lng` 是正式位置欄位，用於後續距離顯示與 location-aware 能力
- 若單筆列暫時缺少 `lat` / `lng`，runtime 可安全視為 `null`，但 owner sheet 應以補齊為目標
- 結果階段的距離提示使用 browser geolocation 搭配 `lat` / `lng`
- 距離提示另有獨立本地記憶層，用來保存上次成功定位的玩家座標

## 目前核心模組對照

- `src/app/` 或目前 app shell：頂層流程與狀態
- `src/features/weather/`：依目前遠征地解析 CWA 鄉鎮預報、標準化與場景映射
- 首頁 UI 對外文案使用 `預計冒險地`，但 runtime state 仍可沿用既有 `currentLocation`
- `src/features/restaurants/`：資料載入、型別、過濾與隨機選取
- `src/features/destiny/`：命運卡型別、定義與抽牌邏輯
- `src/features/card-backs/`：卡背權重與稀有度資料
- `src/features/spin/`：揭示流程狀態機
- `src/features/result/`：結果文案與操作文案
- `src/components/`：共用 UI 元件
- `data/restaurants.json`：本地 fallback 快照
- `data/restaurant-sheet-sources.json`：Google Sheet 來源清單
- `data/cwa-town-locations.json`：正式的 `city / district -> countyCode / townId` weather mapping 管理表
- `images/`：主題資產

## 目前狀態模型

MVP 目前追蹤：

- `activeCategory`
- `availableRestaurants`
- `currentLocation`
- `isLocationChooserOpen`
- `draftCity`
- `draftDistrict`
- `currentCardBack`
- `currentFaceTemplate`
- `currentDestinyCard`
- `selectedDestination`
- `userCoordinates`
- `destinationDistanceState`
- `savedDistancePreference`
- `rerollsRemaining`
- `bonusRerollGranted`
- `phase`

## 已啟用的 location-aware Phase 1 與後續 Phase 2

location-aware 方向已進入 Phase 1，但目前仍不是完整 detect-first runtime；geolocation / IP fallback 仍保留到後續階段。

### 目標

把固定區域的版本升級成 location-aware 產品，同時維持：

- no-login
- same-screen
- low-friction
- static-friendly frontend

### Location Resolution Strategy

長期正式策略固定為：

`detect-first, confirm-lightly, remember-locally`

完整 detect-first 版本的偵測優先序固定為：

1. local saved location
2. browser geolocation
3. IP-based city guess
4. no location

### Phase 1 Runtime Rules

- 若有 saved location，first paint 直接使用
- 若沒有 saved location，先使用 `臺北市中山區` 預設錨點
- 使用者可透過輕量 chooser 覆蓋預設錨點
- 若目前遠征地有 CWA 鄉鎮 mapping，首頁天氣跟著該行政區
- 若目前遠征地沒有 CWA mapping，天氣安全回退到本地 fallback snapshot
- Phase 1 不啟用 browser geolocation
- Phase 1 不啟用 IP-based city guess

補充：

- 以上限制只針對首頁 detect-first location flow
- 結果階段的玩家主動觸發 geolocation，不屬於 first paint detect-first
- 結果階段若曾成功取得玩家座標，refresh 後可直接用本地記住的座標重算距離

### Location Trust Rules

- `manual`：highest trust
- `geolocation`：high trust
- `ip-city`：medium trust
- `unknown`：no trust

完整 detect-first 版本對應處理：

- high trust：直接使用，不打斷流程
- medium trust：可先使用，但要明確提供確認 / 修正入口
- no trust：開啟輕量 chooser

### Current Location State Shape

```json
{
  "city": "臺北市",
  "district": "中山區",
  "source": "default",
  "promptState": "accepted",
  "savedAt": null
}
```

建議欄位：

- `city`
- `district`
- `source`
- `promptState`
- `savedAt`

### Refresh Rules

- 若有 saved location，first paint 直接使用
- 若沒有 saved location，first paint 直接使用中山區預設錨點
- 若 geolocation 曾被拒絕，不可每次 refresh 重新詢問
- manual edit 會覆蓋 auto-detected value

### Phasing

#### Phase 1

已啟用：

- `city` / `district` 資料欄位
- local saved location
- `臺北市中山區` phase-1 default anchor
- lightweight location display
- lightweight manual correction UI
- `district strict -> city strict -> no-location fallback` 過濾順序

仍不要做：

- browser geolocation
- IP geolocation

#### Phase 2

再加：

- browser geolocation
- denial memory
- optional IP city fallback

## 內容系統原則

### 內容是為決策服務，不是為資訊完整服務

內容資料的目的應是：

- 讓使用者可以接受結果
- 讓結果有基本可信度
- 讓後續行動容易接上

而不是：

- 收齊所有資料欄位
- 做成完整目錄
- 做成深度比較工具

### Pack 是產品級單位，不只是資料集合

Pack 代表一組在特定情境下可成立、可被玩、可被接受的內容組合。

### Scenario 決定語境，Theme 決定包裝

- `Scenario` 解決「現在是什麼情境」
- `Theme` 解決「這個情境用什麼語氣與世界觀表現」

### Modifier 只能輕量影響

- 數量少
- 容易理解
- 不增加操作成本
- 優先由系統自動帶入，而不是讓使用者填表

## 長期核心資料物件

### Choice Item

最小可被抽中的內容單位。

建議欄位：

- `id`
- `type`
- `name`
- `shortDescription`
- `primaryTags`
- `secondaryTags`
- `locationLabel`
- `city`
- `district`
- `actionLinks`
- `availabilityMeta`
- `packMembership`
- `scenarioFit`
- `modifierAffinity`
- `promotionStatus`
- `status`

最低可用標準：

- 名稱
- 類型
- 一句描述
- 至少一個有效 action
- 至少屬於一個 Pack

### Pack

特定情境下能成立的內容池。

建議欄位：

- `packId`
- `packName`
- `packType`
- `primaryContentType`
- `supportedScenarios`
- `supportedThemes`
- `supportedModifiers`
- `regionScope`
- `curationPrinciple`
- `inclusionRules`
- `exclusionRules`
- `promotionPolicy`
- `status`

健康標準：

- 邊界清楚
- 語境成立
- 可接受性高於完整性
- action link 有效
- 沒有過度商業偏向

### Scenario

正在被解的決策題目。

建議欄位：

- `scenarioId`
- `scenarioName`
- `scenarioGoal`
- `primaryPackCandidates`
- `allowedContentTypes`
- `recommendedThemes`
- `allowedModifiers`
- `defaultCtaCopy`
- `resultActionTemplate`
- `status`

命名原則：

- 以人話命名
- 反映決策題目
- 不用企劃腔當正式名稱

### Theme

產品包裝層。

建議欄位：

- `themeId`
- `themeName`
- `toneOfVoice`
- `visualDirection`
- `entryCopySet`
- `decisionAnimationStyle`
- `resultCardTemplate`
- `ctaCopySet`
- `compatibleScenarios`
- `themeConstraints`
- `status`

限制：

- 可改變視覺、文案、演出與 CTA 文案
- 不可改變核心流程、決策速度與決策目標

### Modifier

對單輪決策做輕量修飾。

建議欄位：

- `modifierId`
- `modifierName`
- `modifierGroup`
- `modifierEffectType`
- `applicableScenarios`
- `eligibleContentTypes`
- `effectScope`
- `uiLabel`
- `defaultVisibility`
- `status`

建議類型：

- 天氣型
- 時段型
- 心情型
- 條件型

### Session

一次從開始到接受 / 離開的決策流程。

建議欄位：

- `id`
- `startedAt`
- `scenarioId`
- `themeId`
- `packId`
- `selectedType`
- `appliedModifiers`
- `resultItemId`
- `rerollCount`
- `accepted`
- `downstreamAction`
- `sourceContext`

### Promotion Unit

可被掛載進系統的合作型內容單元。

建議欄位：

- `id`
- `promotionType`
- `displayLabel`
- `targetScope`
- `constraints`
- `visibilityRule`
- `trackingRule`
- `status`

## 目前 MVP 資料契約

### RestaurantRecord

目前第一個 `Choice Item` 實作的 contract：

```json
{
  "id": "beef-noodle-01",
  "name": "老街牛肉麵",
  "category": "lunch",
  "city": "臺北市",
  "district": "中山區",
  "mapUrl": "https://maps.app.goo.gl/example",
  "lat": 25.0521,
  "lng": 121.5438,
  "tags": ["noodle", "hot", "soup"],
  "priceLevel": "medium",
  "distanceLevel": "near",
  "isEnabled": true
}
```

### RestaurantCatalogResult

```json
{
  "restaurants": [],
  "status": "live",
  "sourceLabel": "Google Sheet 即時資料"
}
```

`status` 說明：

- `live`：成功抓到即時 Google Sheet
- `fallback`：抓取失敗，改用本地快照
- `loading`：已有 fallback，同時仍在刷新即時資料

補充說明：

- `sourceLabel` 屬於正式 runtime metadata
- 是否將 `sourceLabel` 直接露出在首頁，屬於 UX 決策，不預設要求為第一級首頁資訊

### DestinyCard

目前第一個 hidden modifier contract：

```json
{
  "id": "swift-wind",
  "name": "疾風祝福",
  "type": "filter",
  "description": "只從近距離據點中抽取今日遠征地。",
  "filter": {
    "distanceLevel": ["near"]
  },
  "allowReroll": false
}
```

## 目前選取規則

目前過濾順序固定為：

1. category
2. enabled flag
3. location filter：`district strict -> city strict -> no-location fallback`
4. destiny-card filter
5. 若 destiny-card filter 為空，回退到 location-resolved pool

這個規則不可改成死路回合。

## Location-Aware Filtering Rules

目前 location-aware 模式已啟用，正式原則為：

1. category
2. enabled flag
3. location filter：`district strict -> city strict -> no-location fallback`
4. destiny-card filter
5. 若結果為空，回退到 location-resolved pool

換句話說，正式產品原則是：

`district strict -> city strict -> safe fallback`

細則：

- 若使用者明確選了 `city + district`，只能使用該 district pool；該類別為空時結果就是 `0`
- 若使用者只選了 `city`，只能使用該 city pool；該類別為空時結果就是 `0`
- 只有在沒有 location state 的情況下，才允許回退到 category enabled pool

補充：

- Phase 1 的 weather runtime 已可跟隨目前遠征地，但仍只涵蓋已有 CWA mapping 的行政區
- Phase 1 的 CWA mapping source of truth 為 `data/cwa-town-locations.json`
- district 級背景與 weather 會一起使用目前遠征地
- 無 district 正式背景圖時，背景回退到 `images/backgrounds/shared/`

## 啟用藍圖

### Layer 0：Foundation Layer

目標：建好可擴充骨架，但不要求全部顯示。

最低要求：

- 核心決策骨架
- 穩定資料模型
- 模組邊界
- Theme 配置能力
- Scenario 對應能力
- Promotion 掛載點
- Session / analytics 基礎

### Layer 1：Core Experience Layer

目前正式啟用層。

啟用內容：

- 單一主核心場景
- 單一主題包
- 單一主要內容池組合
- 單次決策流程
- 基本結果頁
- 極簡再抽一次
- 最小必要行動

### Layer 2：Scenario Expansion Layer

建議順序：

1. 午餐
2. 飲料 / 下午茶
3. 晚餐
4. 聚餐
5. 約會去哪
6. 商圈探索

### Layer 3：Theme And Social Amplification Layer

可開內容：

- 多主題包
- 結果分享點
- 截圖友善結果呈現
- 公司內部版 / 節慶版

### Layer 4：Commerce Attachment Layer

前提：

- 已有真實使用
- 已有重複打開
- 已有固定情境
- 已有結果後續行為

## 命名規則

### Pack

建議格式：

`[地區或範圍] + [場景] + [內容型別] + 包`

例如：

- 板橋午餐餐廳包
- 公司周邊下午茶包
- 信義區約會地點包

### Scenario

以使用者人話命名，例如：

- 今天午餐
- 下午茶一下
- 今晚吃什麼
- 兩個人去哪裡

### Theme

反映包裝氣質，例如：

- 奇幻遠征
- 都市命運
- 午夜探險

### Modifier

短、直覺、像使用者會說的話，例如：

- 雨天
- 想近一點
- 想喝甜的

### 背景試作資產

背景試作圖不是正式 runtime asset，不可直接混入 `images/backgrounds/`。

試作資產固定放在：

`output/background-trials/<city>-<district>/`

已核准的 medium 母檔固定放在：

`output/background-finals/<city>-<district>/`

給網站匯入前的 web 最適化導出固定放在：

`output/background-runtime/<city>-<district>/`

正式網站 runtime 背景固定放在：

`images/backgrounds/<city>/<district>/`

既有共享奇幻 fallback 固定放在：

`images/backgrounds/shared/<scene>/`

檔名固定用英文 kebab-case。

trial 檔名：

`background-<city>-<district>-<weather>-<landmark>-trial-<version>.webp`

final 與 runtime 的 canonical 檔名：

`background-<city>-<district>-<weather>-<landmark>.webp`

例如：

- `background-taipei-zhongshan-thunderstorm-xingtian-temple-trial-v5.webp`
- `background-taipei-zhongshan-thunderstorm-xingtian-temple.webp`

欄位原則：

- `city`：城市英文 slug，例如 `taipei`
- `district`：行政區英文 slug，例如 `zhongshan`
- `weather`：天氣英文 slug，例如 `clear-cloudy` / `rain` / `thunderstorm`
- `landmark`：地標英文 slug，例如 `xingtian-temple`
- `trial` 才帶版本，例如 `v1`、`v2`、`v5`
- `final` 與 `runtime` 不帶版本尾巴，檔名固定為 canonical 名稱

正式資料夾結構範例：

```text
images/
  backgrounds/
    shared/
      forest_ruins/
      floating_isles/
      desert_oasis/
      crystal_cavern/
    taipei/
      zhongshan/
        background-taipei-zhongshan-clear-cloudy-xingtian-temple.webp
        background-taipei-zhongshan-overcast-xingtian-temple.webp
        ...
```

Playwright 預覽圖屬於本地驗證產物，固定放在 `output/playwright/`，不作為正式產品資產。

補充規則：

- `output/` 底下的 `trial / final / runtime` 都是本地工區，不是正式同步來源
- 正式可被程式抽選與正式應同步的背景圖，一律以 `images/backgrounds/` 為準

### 背景正式資產規格

正式背景圖只保留 web 交付版本，不保留中間實驗格式。

正式規則：

- runtime 背景正式格式固定為 `webp`
- `png` 只允許作為本地中間實驗檔，不進正式 runtime
- trial 圖可先用較大的暫存檔，但正式上線圖必須另做 web 最適化
- 背景生成的預設畫布固定為 `1536x1024`
- 正式 runtime 背景目標大小為 `150 KB - 350 KB`
- 正式 runtime 背景硬上限為 `500 KB`

品質分層：

- `trial`：`low`
- `final background`：`medium`
- `high` 只保留給少數宣傳級主視覺，不是背景圖預設

升階規則：

- `trial-low` 的角色是確認地標、構圖、氣氛與裁切安全區
- 一旦某張 `trial-low` 被接受，必須先明確指定它是 `lock-master`
- `final-medium` 不可直接用同一 prompt 重新 `generate`
- `final-medium` 必須以已核准的 `trial-low` / `lock-master` 為輸入，走 `edit` 升階
- `edit` 指令必須明確要求：`keep architecture unchanged`、`keep composition unchanged`、`change only weather / detail / polish`
- 正式流程應視為：`trial-low -> lock-master -> final-medium-edit -> runtime-webp`
- `final-medium` 的輸出目錄是 `output/background-finals/<city>-<district>/`
- `runtime-webp` 的導出目錄是 `output/background-runtime/<city>-<district>/`
- 正式網站讀取目錄是 `images/backgrounds/<city>/<district>/`
- `final-medium` 與正式 `runtime-webp` 的檔名都固定使用 canonical 名稱，不帶版本尾巴

### 背景 manifest 與中英對應規則

使用者可見資料與資料層欄位維持中文，不要求把產品層地名改成英文。

正式策略：

- UI 顯示：中文
- 資料欄位：中文內容值
- 圖檔檔名：英文 slug
- runtime 對應：由背景 manifest 負責，不可在 runtime 直接硬猜拼音

也就是：

- `臺北市` 不直接在 runtime 拼成 `taipei`
- `中山區` 不直接在 runtime 拼成 `zhongshan`
- `行天宮` 不直接在 runtime 拼成 `xingtian-temple`

而是由 manifest 明確對應：

```json
{
  "臺北市": {
    "中山區": {
      "citySlug": "taipei",
      "districtSlug": "zhongshan",
      "landmarks": {
        "xingtian-temple": {
          "labelZh": "行天宮"
        }
      }
    }
  }
}
```

天氣狀態則直接沿用既有英文 variant key：

- `clear_cloudy`
- `overcast`
- `rain`
- `heavy_rain`
- `thunderstorm`
- `dense_fog`
- `freezing_fog`
- `snow`

背景檔名與中文資料層之間的唯一正式橋接層，就是 manifest。

目前正式使用兩份 manifest：

- `images/backgrounds/district-manifest.json`
  - 管理中文 `city / district` 到英文 slug 背景路徑的對應
  - 管理 district 級 `weather_pools`
- `images/backgrounds/shared-manifest.json`
  - 管理共享奇幻 fallback 背景與 CWA Wx variant 對應

### 背景選圖流程

背景選圖不可只靠檔名推算，應固定依以下順序：

1. 先讀取目前位置的中文 `city / district`
2. 再讀取目前天氣對應的英文 `variantKey`
3. 以 `city / district` 查背景 manifest
4. 取得該 district 在該 `variantKey` 下可用的地標池
5. 從可用地標池中做隨機或加權隨機
6. 回傳該圖檔的正式 runtime path

### 同區多景點規則

若一個行政區有多個景點，背景不是固定單圖，而是同區同天氣下的景點池。

例如：

- `臺北市 / 中山區 / thunderstorm`

可對應：

- `xingtian-temple`
- `rongxing-garden`
- `taipei-fine-arts-park`

正式規則：

- 只有「該天氣下有正式圖」的景點才能進入抽圖池
- 預設先用均勻隨機
- 若未來需要控制體感，可再加 `weight`

建議結構：

```json
{
  "臺北市": {
    "中山區": {
      "weatherPools": {
        "thunderstorm": [
          { "landmark": "xingtian-temple", "weight": 5 },
          { "landmark": "rongxing-garden", "weight": 3 },
          { "landmark": "taipei-fine-arts-park", "weight": 2 }
        ]
      }
    }
  }
}
```

### 背景 fallback 順序

背景選圖不能因缺圖而中斷首頁。

正式 fallback 順序固定為：

1. `city + district + weather` 的正式背景池
2. 既有共享奇幻天氣背景 `images/backgrounds/shared-manifest.json`

也就是說：

- district 級背景若尚未做滿，不得造成首頁空白
- location-aware 背景庫仍未完整前，舊的共享奇幻背景是正式保底層

## 技術實作注意事項

- 所有核心物件要有穩定 id
- 配置與內容盡可能分離
- 不把業務規則散落在 UI 細節中
- 不把合作邏輯直接塞進 decision engine
- analytics 以事件化方式設計
- 不因為底層已準備好，就把前台能力一次全打開
