import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { uiOrnaments } from './assets/ui-ornaments';
import { DestinyCardView } from './components/destiny-card-view';
import { DistanceStrip } from './components/distance-strip';
import { LocationSheet } from './components/location-sheet';
import { LocationStatus } from './components/location-status';
import { resolveBackgroundSelection } from './features/backgrounds/selector';
import { useDestinationDistance } from './features/location/use-destination-distance';
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

function createBackgroundSeed() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
  }

  return (Date.now() % 1000) / 1000;
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [backgroundSeed] = useState(createBackgroundSeed);
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
  const { snapshot } = useTaipeiWeather(locationPreference.currentLocation);
  const backgroundSelection = useMemo(
    () =>
      resolveBackgroundSelection({
        location: locationPreference.currentLocation,
        period: snapshot.currentPeriod,
        randomValue: backgroundSeed,
      }),
    [
      backgroundSeed,
      locationPreference.currentLocation.city,
      locationPreference.currentLocation.district,
      snapshot.currentPeriod.wxCode,
      snapshot.currentPeriod.highTemp,
      snapshot.currentPeriod.lowTemp,
    ],
  );
  const rerollCopy = getRerollCopy(rerollsRemaining);
  const categoryLabel = activeCategory ? getCategoryLabel(activeCategory) : '';
  const destinationDistance = useDestinationDistance(
    phase === 'result' ? round?.destination ?? null : null,
  );
  const activeCategoryCount = activeCategory
    ? getLocationAwareCandidatePool(
        restaurantCatalog.restaurants,
        activeCategory,
        locationPreference.currentLocation,
      ).length
    : 0;
  const weatherSceneLine = `${backgroundSelection.sceneLabel} · ${backgroundSelection.variantLabel}`;
  const weatherPrimaryLine =
    snapshot.currentPeriod.currentTemp !== undefined
      ? `${snapshot.currentPeriod.weatherText} · 現在 ${snapshot.currentPeriod.currentTemp}°`
      : `${snapshot.currentPeriod.weatherText} · ${snapshot.currentPeriod.lowTemp}°-${snapshot.currentPeriod.highTemp}°`;
  const weatherSecondaryLine =
    snapshot.currentPeriod.feelsLikeTemp !== undefined
      ? `體感 ${snapshot.currentPeriod.feelsLikeTemp}° · 今日 ${snapshot.currentPeriod.lowTemp}°-${snapshot.currentPeriod.highTemp}°`
      : `降雨 ${snapshot.currentPeriod.pop}% · ${getComfortCopy(snapshot.currentPeriod.comfort)}`;

  const startButtonLabel =
    activeCategory === null ? '準備好了嗎？' : '決定今日命運';

  return (
    <main className="app-shell">
      <div
        className="scene-surface"
        style={{ backgroundImage: `url(${backgroundSelection.imageUrl})` }}
      >
        <div className="scene-vignette" />
        <section className="central-altar" aria-label="今日遠征告示牌">
          <div className="title-block">
            <h1 className="hero-title">
              <span className="hero-title-line">今天吃什麼</span>
              <span className="hero-title-line">命運遠征</span>
            </h1>
            <p className="scene-line">{weatherSceneLine}</p>
            <LocationStatus
              locationLabel={locationPreference.currentLocationLabel}
              triggerLabel={locationPreference.locationTriggerLabel}
              onOpen={locationPreference.openChooser}
            />
            <p className="forecast-source-line">預計冒險地 3 小時天氣預報</p>
            <div className="weather-lines">
              <p className="weather-line">{weatherPrimaryLine}</p>
              <p className="weather-line weather-line-soft">{weatherSecondaryLine}</p>
            </div>
          </div>

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
              : '請先選擇冒險方向'}
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
            <div className="result-support">
              {destinationDistance.status !== 'hidden' ? (
                <DistanceStrip
                  status={destinationDistance.status}
                  label={destinationDistance.label}
                  onRequest={destinationDistance.requestDistance}
                />
              ) : null}
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
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
