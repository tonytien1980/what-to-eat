import { useState } from 'react';
import type { CSSProperties } from 'react';
import { uiOrnaments } from './assets/ui-ornaments';
import { DestinyCardView } from './components/destiny-card-view';
import { LocationSheet } from './components/location-sheet';
import { LocationStatus } from './components/location-status';
import { useLocationPreference } from './features/location/use-location-preference';
import { categories } from './features/restaurants/data';
import { getLocationAwareCandidatePool } from './features/restaurants/selectors';
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
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const restaurantCatalog = useRestaurantCatalog();
  const locationPreference = useLocationPreference(restaurantCatalog.restaurants);
  const {
    phase,
    round,
    currentCardBack,
    rerollsRemaining,
    start,
    reroll,
    canReroll,
    isAnimating,
  } = useExpedition(
    activeCategory,
    restaurantCatalog.restaurants,
    locationPreference.currentLocation,
  );
  const { snapshot } = useTaipeiWeather();
  const rerollCopy = getRerollCopy(rerollsRemaining);
  const categoryLabel = activeCategory ? getCategoryLabel(activeCategory) : '';
  const activeCategoryCount = activeCategory
    ? getLocationAwareCandidatePool(
        restaurantCatalog.restaurants,
        activeCategory,
        locationPreference.currentLocation,
      ).length
    : 0;
  const weatherSceneLine = `${snapshot.cityName} · ${snapshot.activeScene.sceneLabel} · ${snapshot.activeScene.variantLabel}`;
  const weatherPrimaryLine =
    snapshot.currentPeriod.currentTemp !== undefined
      ? `${snapshot.currentPeriod.weatherText} · 現在 ${snapshot.currentPeriod.currentTemp}°`
      : `${snapshot.currentPeriod.weatherText} · ${snapshot.currentPeriod.lowTemp}°-${snapshot.currentPeriod.highTemp}°`;
  const weatherSecondaryLine =
    snapshot.currentPeriod.feelsLikeTemp !== undefined
      ? `體感 ${snapshot.currentPeriod.feelsLikeTemp}° · 今日 ${snapshot.currentPeriod.lowTemp}°-${snapshot.currentPeriod.highTemp}°`
      : `降雨 ${snapshot.currentPeriod.pop}% · ${getComfortCopy(snapshot.currentPeriod.comfort)}`;

  const startButtonLabel =
    activeCategory === null ? '先選遠征類型' : '開啟今日遠征';

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

          <LocationStatus
            locationLabel={locationPreference.currentLocationLabel}
            triggerLabel={locationPreference.locationTriggerLabel}
            onOpen={locationPreference.openChooser}
          />

          <LocationSheet
            isOpen={locationPreference.isChooserOpen}
            cityGroups={locationPreference.locationGroups}
            districtOptions={locationPreference.districtOptions}
            draftCity={locationPreference.draftCity}
            draftDistrict={locationPreference.draftDistrict}
            onCityChange={locationPreference.updateDraftCity}
            onDistrictChange={locationPreference.updateDraftDistrict}
            onSkipDistrict={locationPreference.skipDistrict}
            onClose={locationPreference.closeChooser}
            onSave={locationPreference.saveDraft}
          />

          <div className="category-tabs" role="tablist" aria-label="遠征類型">
            {categories.map((category) => (
              <button
                key={category.id}
                className={
                  category.id === activeCategory
                    ? 'category-pill category-pill-active'
                    : 'category-pill'
                }
                style={
                  {
                    backgroundImage: `url(${
                      category.id === activeCategory
                        ? uiOrnaments.categoryButtonNoticeActive
                        : uiOrnaments.categoryButtonNotice
                    })`,
                  } as CSSProperties
                }
                type="button"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <p className="status-copy">
            {activeCategory
              ? getCategorySummary(activeCategory, activeCategoryCount)
              : '請先選擇遠征類型'}
          </p>

          <button
            className="start-button"
            style={
              {
                backgroundImage: `url(${uiOrnaments.ctaScrollBannerOrnate})`,
              } as CSSProperties
            }
            type="button"
            onClick={start}
            disabled={
              isAnimating ||
              restaurantCatalog.restaurants.length === 0 ||
              activeCategory === null
            }
          >
            <span className="start-button-label">
              {isAnimating
                ? '遠征占卜中...'
                : restaurantCatalog.restaurants.length === 0
                  ? '目前沒有可用據點'
                  : startButtonLabel}
            </span>
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
