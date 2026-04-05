import { useState } from 'react';
import { categories } from './features/restaurants/data';
import {
  getCategorySummary,
  getPhaseLabel,
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
    hasRerolled,
    start,
    reroll,
    isAnimating,
    showReroll,
    canReroll,
  } = useExpedition(activeCategory);

  return (
    <main className="app-shell">
      <section className="quest-board" aria-label="今日遠征告示牌">
        <div className="board-layout">
          <section className="board-intro">
            <p className="eyebrow">{getPhaseLabel(phase)}</p>
            <h1>今天吃什麼：命運遠征</h1>
            <p className="tagline">
              召集旅伴、啟動命運，讓今天的午餐像接下一張告示牌任務。
            </p>
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
                <article
                  className={
                    phase === 'revealing'
                      ? 'destiny-card destiny-card-revealing'
                      : 'destiny-card'
                  }
                >
                  <p className="phase-badge">{getPhaseLabel(phase)}</p>
                  <h2>命運卡：{round.destinyCard.name}</h2>
                  <p className="card-description">{round.destinyCard.description}</p>
                </article>

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
                          {hasRerolled ? '逆天改命已用盡' : '逆天改命'}
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
