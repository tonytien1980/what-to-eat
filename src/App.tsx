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
import {
  getAltarSceneAsset,
} from './features/weather/cwa-county';
import { useTaipeiWeather } from './features/weather/useTaipeiWeather';
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
  const { snapshot, status } = useTaipeiWeather();
  const rerollCopy = getRerollCopy(rerollsRemaining);
  const forecastPeriods = [snapshot.currentPeriod, ...snapshot.upcomingPeriods];
  const altarBackdropUrl = getAltarSceneAsset();

  return (
    <main className="app-shell">
      <div
        className="scene-surface"
        style={{ backgroundImage: `url(${snapshot.activeScene.imageUrl})` }}
      >
        <div className="scene-vignette" />
        <section className="interface-shell" aria-label="今日遠征告示牌">
          <section className="command-panel">
            <div className="scene-status-row">
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
              <p className="city-kicker">臺北市今日場景</p>
              <h1>今天吃什麼：命運遠征</h1>
              <p className="tagline">
                讓台北天氣先決定今天的異世界場景，再讓命運把餐廳縮成一個答案。
              </p>
            </div>

            <section className="weather-hero-card">
              <div className="weather-hero-copy">
                <p className="hero-kicker">
                  {snapshot.activeScene.sceneLabel} · {snapshot.activeScene.variantLabel}
                </p>
                <h2>{snapshot.currentPeriod.weatherText}</h2>
                <p>
                  {snapshot.currentPeriod.timeRange}，氣溫{' '}
                  {snapshot.currentPeriod.lowTemp}°C - {snapshot.currentPeriod.highTemp}°C，
                  降雨 {snapshot.currentPeriod.pop}%。
                </p>
              </div>
              <div className="weather-hero-metrics">
                <span className="weather-metric">
                  <strong>{snapshot.currentPeriod.highTemp}°</strong>
                  <span>最高溫</span>
                </span>
                <span className="weather-metric">
                  <strong>{snapshot.currentPeriod.pop}%</strong>
                  <span>降雨率</span>
                </span>
                <span className="weather-metric">
                  <strong>{snapshot.currentPeriod.comfort}</strong>
                  <span>舒適度</span>
                </span>
              </div>
            </section>

            <div className="forecast-strip">
              {forecastPeriods.map((period, index) => {
                const scene = snapshot.forecastScenes[index];

                return (
                  <article
                    key={`${period.type}-${period.timeRange}`}
                    className={index === 0 ? 'forecast-card forecast-card-active' : 'forecast-card'}
                  >
                    <img alt="" className="forecast-card-image" src={scene.imageUrl} />
                    <div className="forecast-card-overlay" />
                    <div className="forecast-card-content">
                      <p>{period.timeRange}</p>
                      <h3>{scene.sceneLabel}</h3>
                      <span>
                        {period.weatherText} · {period.lowTemp}°-{period.highTemp}°
                      </span>
                    </div>
                  </article>
                );
              })}
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
              <span className="meta-pill">目前有 {restaurants.length} 家可抽</span>
            </div>

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
                    meta={[
                      rerollCopy.hint,
                      `資料池 ${round.pool.length} 家`,
                      `台北場景 ${snapshot.activeScene.variantLabel}`,
                    ]}
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
                        不想吃這家也沒關係，這一局還能直接重選，不用再回首頁。
                      </p>
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
                  <h2>先看天氣，再決定今天的命運。</h2>
                  <p className="card-description">
                    目前背景就是台北市預報對應的場景。選好餐別後，按下開始，命運卡會在這座祭壇上翻面。
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
