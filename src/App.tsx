import { useState } from 'react';
import { DestinyCardView } from './components/destiny-card-view';
import { categories } from './features/restaurants/data';
import {
  getCategorySummary,
  getPhaseLabel,
  getRerollCopy,
  getRoundSummary,
  getSlotLabel,
} from './features/result/result-copy';
import { useRestaurantCatalog } from './features/restaurants/use-restaurant-catalog';
import { useExpedition } from './features/spin/useExpedition';
import { getAltarSceneAsset } from './features/weather/cwa-county';
import { useTaipeiWeather } from './features/weather/useTaipeiWeather';
import type { Category } from './features/restaurants/types';
import './styles.css';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('lunch');
  const restaurantCatalog = useRestaurantCatalog();
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
  } = useExpedition(activeCategory, restaurantCatalog.restaurants);
  const { snapshot, status } = useTaipeiWeather();
  const rerollCopy = getRerollCopy(rerollsRemaining);
  const altarBackdropUrl = getAltarSceneAsset();

  return (
    <main className="app-shell">
      <div
        className="scene-surface"
        style={{ backgroundImage: `url(${snapshot.activeScene.imageUrl})` }}
      >
        <div className="scene-vignette" />
        <section className="central-altar" aria-label="今日遠征告示牌">
          <div className="top-status">
            <p className="eyebrow">{getPhaseLabel(phase)}</p>
            <span className={`weather-source-pill weather-source-${status}`}>
              {status === 'ready'
                ? snapshot.sourceLabel
                : status === 'loading'
                  ? '讀取台北市預報中'
                  : '天氣讀取失敗，先用預設場景'}
            </span>
          </div>

          <div className="title-block">
            <p className="city-kicker">
              臺北市 · {snapshot.activeScene.sceneLabel} · {snapshot.activeScene.variantLabel}
            </p>
            <h1>今天吃什麼：命運遠征</h1>
            <p className="tagline">
              台北天氣先決定今天的冒險場景，命運卡再決定你這一餐的答案。
            </p>
          </div>

          <div className="weather-strip">
            <span className="weather-pill">{snapshot.currentPeriod.weatherText}</span>
            <span className="weather-pill">
              {snapshot.currentPeriod.lowTemp}°-{snapshot.currentPeriod.highTemp}°
            </span>
            <span className="weather-pill">降雨 {snapshot.currentPeriod.pop}%</span>
            <span className="weather-pill">{snapshot.currentPeriod.comfort}</span>
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

          <div className="control-row">
            <p className="status-copy">{getCategorySummary(activeCategory)}</p>
            <div className="control-meta-group">
              <span
                className={`meta-pill restaurant-source-pill restaurant-source-${restaurantCatalog.status}`}
              >
                {restaurantCatalog.sourceLabel}
              </span>
              <span className="meta-pill">可抽 {restaurantCatalog.restaurants.length} 家</span>
            </div>
          </div>

          <button
            className="start-button"
            type="button"
            onClick={start}
            disabled={isAnimating || restaurantCatalog.restaurants.length === 0}
          >
            {isAnimating
              ? '命運正在編織結果...'
              : restaurantCatalog.restaurants.length === 0
                ? '目前沒有可用據點'
                : '開啟今日遠征'}
          </button>

          <section
            className={
              phase === 'idle'
                ? 'altar-panel altar-panel-idle'
                : `altar-panel altar-panel-${phase}`
            }
            aria-live="polite"
            style={{ backgroundImage: `url(${altarBackdropUrl})` }}
          >
            <div className="altar-overlay" />
            <div className="altar-content">
              {round ? (
                <>
                  <DestinyCardView
                    backdropUrl={snapshot.activeScene.imageUrl}
                    card={round.destinyCard}
                    isRevealing={phase === 'revealing'}
                    meta={[rerollCopy.hint, `場景 ${snapshot.activeScene.variantLabel}`]}
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
                      <div className="reroll-status">
                        <span className="reroll-counter">{rerollsRemaining}</span>
                        <span>{rerollCopy.hint}</span>
                      </div>
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
                  <p className="phase-badge">台北市預報已接通</p>
                  <h2>背景是場景，中央才是命運祭壇。</h2>
                  <p className="card-description">
                    先選餐別，再按開始。其餘畫面讓背景自己說故事，不再把場景蓋住。
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
