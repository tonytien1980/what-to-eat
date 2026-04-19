import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useTaipeiWeather, WEATHER_REFRESH_INTERVAL_MS } from '../features/weather/useTaipeiWeather';
import type { TaipeiWeatherSnapshot } from '../features/weather/types';

const loadTaipeiWeatherSnapshotMock = vi.fn();

vi.mock('../features/weather/cwa-county', async () => {
  const actual = await vi.importActual<typeof import('../features/weather/cwa-county')>(
    '../features/weather/cwa-county',
  );

  return {
    ...actual,
    createFallbackTaipeiWeatherSnapshot: vi.fn(
      (): TaipeiWeatherSnapshot => ({
        cityName: '臺北市松山區',
        issuedTime: 'fallback',
        sourceLabel: '3 小時天氣預報',
        currentPeriod: {
          timeRange: '松山區未來 24 小時',
          type: '3hr',
          lowTemp: 20,
          highTemp: 27,
          pop: 0,
          wxCode: 15,
          weatherText: '短暫陣雨或雷雨',
          comfort: '舒適',
          currentTemp: 22,
          feelsLikeTemp: 24,
        },
        upcomingPeriods: [],
        activeScene: {
          sceneKey: 'forest_ruins',
          sceneLabel: '森林遺跡',
          variantKey: 'thunderstorm',
          variantLabel: '雷雨',
          imageUrl: '/fallback.webp',
          assetPath: 'shared/fallback.webp',
        },
        forecastScenes: [],
      }),
    ),
    loadTaipeiWeatherSnapshot: (...args: Parameters<typeof actual.loadTaipeiWeatherSnapshot>) =>
      loadTaipeiWeatherSnapshotMock(...args),
  };
});

function createSnapshot(weatherText: string): TaipeiWeatherSnapshot {
  return {
    cityName: '臺北市松山區',
    issuedTime: 'official',
    sourceLabel: '3 小時天氣預報',
    currentPeriod: {
      timeRange: '松山區未來 24 小時',
      type: '3hr',
      lowTemp: 23,
      highTemp: 32,
      pop: 0,
      wxCode: weatherText === '陰' ? 7 : 15,
      weatherText,
      comfort: '舒適',
      currentTemp: 28,
      feelsLikeTemp: 32,
    },
    upcomingPeriods: [],
    activeScene: {
      sceneKey: weatherText === '陰' ? 'floating_isles' : 'forest_ruins',
      sceneLabel: weatherText === '陰' ? '漂浮群島' : '森林遺跡',
      variantKey: weatherText === '陰' ? 'overcast' : 'thunderstorm',
      variantLabel: weatherText === '陰' ? '陰天' : '雷雨',
      imageUrl: '/weather.webp',
      assetPath: 'shared/weather.webp',
    },
    forecastScenes: [],
  };
}

function TestHarness() {
  const { snapshot } = useTaipeiWeather({
    city: '臺北市',
    district: '松山區',
  });

  return <p>{snapshot.currentPeriod.weatherText}</p>;
}

beforeEach(() => {
  globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__ = true;
  loadTaipeiWeatherSnapshotMock.mockReset();
  vi.useFakeTimers();
});

afterEach(() => {
  delete globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__;
  vi.useRealTimers();
});

test('refreshes town weather when the page regains focus', async () => {
  loadTaipeiWeatherSnapshotMock
    .mockResolvedValueOnce(createSnapshot('短暫陣雨或雷雨'))
    .mockResolvedValueOnce(createSnapshot('陰'));

  render(<TestHarness />);

  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getByText('短暫陣雨或雷雨')).toBeInTheDocument();

  await act(async () => {
    window.dispatchEvent(new Event('focus'));
    await Promise.resolve();
  });

  expect(screen.getByText('陰')).toBeInTheDocument();
  expect(loadTaipeiWeatherSnapshotMock).toHaveBeenCalledTimes(2);
});

test('refreshes town weather on the periodic refresh interval', async () => {
  loadTaipeiWeatherSnapshotMock
    .mockResolvedValueOnce(createSnapshot('短暫陣雨或雷雨'))
    .mockResolvedValueOnce(createSnapshot('陰'));

  render(<TestHarness />);

  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getByText('短暫陣雨或雷雨')).toBeInTheDocument();

  await act(async () => {
    vi.advanceTimersByTime(WEATHER_REFRESH_INTERVAL_MS);
    await Promise.resolve();
  });

  expect(screen.getByText('陰')).toBeInTheDocument();
  expect(loadTaipeiWeatherSnapshotMock).toHaveBeenCalledTimes(2);
});
