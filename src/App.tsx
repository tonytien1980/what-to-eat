import { useState } from 'react';
import { DestinyCardView } from './components/destiny-card-view';
import { categories, restaurants } from './features/restaurants/data';
import {
  getCategorySummary,
  getPhaseLabel,
  getRerollCopy,
  getRoundSummary,
  getSlotLabel,
} from './features/result/result-copy';
import { useExpedition } from './features/spin/useExpedition';
import type { Category } from './features/restaurants/types';
import './styles.css';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('lunch');
  const {
    phase,
    round,
    displayedName,
    rerollsRemaining,
    start,
    reroll,
    isAnimating,
    showReroll,
    canReroll,
  } = useExpedition(activeCategory);
  const rerollCopy = getRerollCopy(rerollsRemaining);

  return (
    <main className="app-shell">
      <section className="quest-board" aria-label="今日遠征告示牌">
        <div className="board-layout">
          <section className="board-intro">
            <p className="eyebrow">{getPhaseLabel(phase)}</p>
            <h1>今天吃什麼：命運遠征</h1>
            <p className="tagline">
              別再開十個分頁找餐廳了，讓命運先幫你把答案縮到只剩一個。
            </p>
            <div className="intro-meta">
              <span className="meta-pill">同螢幕直接玩</span>
              <span className="meta-pill">90 秒內決定</span>
              <span className="meta-pill">現在有 {restaurants.length} 家可抽</span>
            </div>
            <div className="category-tabs" role="tablist" aria-label="遠征類型">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    category.id === activeCategory
                      ? 'category-pill category-pill-active'
                      : 'category-pill'
                  }
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <p className="status-copy">{getCategorySummary(activeCategory)}</p>
            <button
              className="start-button"
              type="button"
              onClick={start}
              disabled={isAnimating}
            >
              {isAnimating ? '命運正在編織結果...' : '開啟今日遠征'}
            </button>
          </section>

          <section
            className={
              phase === 'idle'
                ? 'oracle-panel oracle-panel-idle'
                : `oracle-panel oracle-panel-${phase}`
            }
            aria-live="polite"
          >
            {round ? (
              <>
                <DestinyCardView
                  card={round.destinyCard}
                  isRevealing={phase === 'revealing'}
                  meta={[rerollCopy.hint, `資料池 ${round.pool.length} 家`]}
                  phaseLabel={getPhaseLabel(phase)}
                />

                <div className="slot-stage">
                  <p className="slot-label">{getSlotLabel(phase)}</p>
                  <div
                    className={
                      phase === 'spinning'
                        ? 'slot-window slot-window-spinning'
                        : 'slot-window'
                    }
                  >
                    <span className="slot-name">
                      {phase === 'revealing' ? '命運正在降臨' : displayedName}
                    </span>
                  </div>
                </div>

                {phase === 'result' ? (
                  <div className="result-actions">
                    <p className="result-summary">{getRoundSummary(round)}</p>
                    <p className="result-subcopy">
                      不想吃這家也沒關係，下面直接再抽，不用重開整局。
                    </p>
                    <div className="action-row">
                      <a
                        className="map-link"
                        href={round.destination.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        出發去吃
                      </a>
                      {showReroll ? (
                        <button
                          className="reroll-button"
                          type="button"
                          disabled={!canReroll}
                          onClick={reroll}
                        >
                          {rerollCopy.label}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="idle-state">
                <p className="phase-badge">酒館告示牌</p>
                <h2>命運之輪尚未啟動</h2>
                <p className="card-description">
                  先選好遠征類型，再按下開始，讓命運卡與據點名單替你縮短猶豫。
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
