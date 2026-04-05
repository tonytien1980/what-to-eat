import { useState } from 'react';
import { categories } from './features/restaurants/data';
import { getCategorySummary, getRoundSummary } from './features/result/result-copy';
import { startExpedition, type ExpeditionRound } from './features/spin/useExpedition';
import type { Category } from './features/restaurants/types';
import './styles.css';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('lunch');
  const [round, setRound] = useState<ExpeditionRound | null>(null);
  const [hasRerolled, setHasRerolled] = useState(false);

  const handleStart = () => {
    setHasRerolled(false);
    setRound(startExpedition(activeCategory));
  };

  const handleReroll = () => {
    if (!round || hasRerolled) {
      return;
    }

    setHasRerolled(true);
    setRound(startExpedition(activeCategory));
  };

  return (
    <main className="app-shell">
      <section className="quest-board" aria-label="今日遠征告示牌">
        <p className="eyebrow">命運之輪已待命</p>
        <h1>今天吃什麼：命運遠征</h1>
        <p className="tagline">
          召集旅伴、啟動命運、讓今天的午餐自己現身。
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
        <button className="start-button" type="button" onClick={handleStart}>
          開啟今日遠征
        </button>
        {round ? (
          <section className="result-panel" aria-live="polite">
            <p className="result-kicker">命運卡：{round.destinyCard.name}</p>
            <p className="result-summary">{getRoundSummary(round)}</p>
            <h2>本日遠征目的地</h2>
            <p className="destination-name">{round.destination.name}</p>
            <p className="result-summary">{round.destinyCard.description}</p>
            <a
              className="map-link"
              href={round.destination.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              出發去吃
            </a>
            {round.canReroll || hasRerolled ? (
              <button
                className="reroll-button"
                type="button"
                disabled={hasRerolled || !round.canReroll}
                onClick={handleReroll}
              >
                逆天改命
              </button>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
