import { useState } from 'react';
import { DestinyCardView } from './components/destiny-card-view';
import { categories } from './features/restaurants/data';
import { getCandidatePool } from './features/restaurants/selectors';
import {
  getCategoryLabel,
  getCategorySummary,
  getComfortCopy,
  getRerollCopy,
} from './features/result/result-copy';
import { useRestaurantCatalog } from './features/restaurants/use-restaurant-catalog';
import { useExpedition } from './features/spin/useExpedition';
import { useTaipeiWeather } from './features/weather/useTaipeiWeather';
import type { Category } from './features/restaurants/types';
import './styles.css';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('lunch');
  const restaurantCatalog = useRestaurantCatalog();
  const {
    phase,
    round,
    currentCardBack,
    rerollsRemaining,
    start,
    reroll,
    canReroll,
    isAnimating,
  } = useExpedition(activeCategory, restaurantCatalog.restaurants);
  const { snapshot } = useTaipeiWeather();
  const rerollCopy = getRerollCopy(rerollsRemaining);
  const categoryLabel = getCategoryLabel(activeCategory);
  const activeCategoryCount = getCandidatePool(
    restaurantCatalog.restaurants,
    activeCategory,
  ).length;
  const weatherSceneLine = `臺北市 · ${snapshot.activeScene.sceneLabel} · ${snapshot.activeScene.variantLabel}`;
  const weatherPrimaryLine = `${snapshot.currentPeriod.weatherText} · ${snapshot.currentPeriod.lowTemp}°-${snapshot.currentPeriod.highTemp}°`;
  const weatherSecondaryLine = `降雨 ${snapshot.currentPeriod.pop}% · ${getComfortCopy(snapshot.currentPeriod.comfort)}`;

  return (
    <main className="app-shell">
      <div
        className="scene-surface"
        style={{ backgroundImage: `url(${snapshot.activeScene.imageUrl})` }}
      >
        <div className="scene-vignette" />
        <section className="central-altar" aria-label="今日遠征告示牌">
          <div className="title-block">
            <h1 className="hero-title">
              <span className="hero-title-line">今天吃什麼</span>
              <span className="hero-title-line">命運遠征</span>
            </h1>
            <p className="scene-line">{weatherSceneLine}</p>
            <div className="weather-lines">
              <p className="weather-line">{weatherPrimaryLine}</p>
              <p className="weather-line weather-line-soft">{weatherSecondaryLine}</p>
            </div>
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

          <p className="status-copy">
            {getCategorySummary(activeCategory, activeCategoryCount)}
          </p>

          <button
            className="start-button"
            type="button"
            onClick={start}
            disabled={isAnimating || restaurantCatalog.restaurants.length === 0}
          >
            {isAnimating
              ? '遠征占卜中...'
              : restaurantCatalog.restaurants.length === 0
                ? '目前沒有可用據點'
                : '開啟今日遠征'}
          </button>

          <section
            className={`altar-panel altar-panel-${phase}`}
            aria-live="polite"
          >
            <div className="altar-content">
              <DestinyCardView
                cardBack={round?.cardBack ?? currentCardBack}
                categoryLabel={categoryLabel}
                destinationName={round?.destination.name}
                phase={phase}
              />
            </div>
          </section>

          {phase === 'result' && round ? (
            <div className="altar-actions">
              <a
                className="map-link"
                href={round.destination.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                出發去吃
              </a>
              <button
                className="reroll-button"
                type="button"
                disabled={!canReroll}
                onClick={reroll}
              >
                {rerollCopy.label}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
