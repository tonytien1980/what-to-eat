# Rarity Glow And Breathing Design

## Goal

調整卡片稀有度的光暈與動效層級，讓 `common` 不再像弱版 `rare`，並讓 `rare / epic / legendary / hidden` 各自有清楚的節奏與辨識度。

## Approved Direction

- `common`：不呼吸，主打象牙白卡框、細內光與卡牌材質感
- `rare`：最輕的白光呼吸，慢、乾淨、幅度小
- `epic`：暖金呼吸，比 `rare` 更亮一階
- `legendary`：厚重紫光呼吸，比 `epic` 更集中
- `hidden`：保留藍光掃描與異常能量感，不走一般呼吸節奏

## Visual Rules

### Shared Base

- 所有卡片都維持深色核心描邊與柔和黑影
- 邊框本身需跟著 rarity 染色，不只靠外圈 glow
- 透明 aura 舞台保留，但不應回退成黑色大面板

### Common

- 不做常駐呼吸動畫
- 主體依賴較明顯的象牙白邊框與淡內光
- 外層 halo 應比 `rare` 顯著更弱

### Rare

- 使用最輕的白光呼吸
- 應該一眼感受到「開始發光」
- 動畫節奏慢且平滑，不應搶畫面

### Epic

- 使用暖金呼吸
- 比 `rare` 更亮、更有能量聚散感
- 保持高貴，不做閃爍感

### Legendary

- 使用厚重紫光呼吸
- 呼吸較集中，像神器脈動
- 存在感高於 `epic`

### Hidden

- 保留藍光掃描與異常流動
- 可維持少量 aura 變化，但不走普通呼吸節奏

## Motion Rules

- `revealing` 階段仍然比 `result` 階段更亮
- `result` 階段需收斂，但不能把稀有度差異收掉
- `common` 無常駐 pulse
- `rare / epic / legendary` 都可有常駐 breathing，但節奏與幅度必須分級
- `hidden` 以 scan / anomaly 感為主，不與其他等級共用同一組 pulse
