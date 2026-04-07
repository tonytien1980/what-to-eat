import {
  resolveBackgroundSelection,
  resolveDistrictBackgroundSelectionFromManifest,
} from '../features/backgrounds/selector';
import type { CwaForecastPeriod } from '../features/weather/types';

const thunderstormPeriod: CwaForecastPeriod = {
  timeRange: '中山區未來 24 小時',
  type: '3hr',
  lowTemp: 20,
  highTemp: 27,
  pop: 0,
  wxCode: 15,
  weatherText: '短暫陣雨或雷雨',
  comfort: '舒適',
  currentTemp: 22,
  feelsLikeTemp: 24,
};

test('uses district background assets when a matching city district weather pool exists', () => {
  const selection = resolveBackgroundSelection({
    location: {
      city: '臺北市',
      district: '中山區',
    },
    period: thunderstormPeriod,
    randomValue: 0.2,
  });

  expect(selection.source).toBe('district');
  expect(selection.sceneLabel).toBe('行天宮');
  expect(selection.variantKey).toBe('thunderstorm');
  expect(selection.variantLabel).toBe('雷雨');
  expect(selection.assetPath).toBe(
    'taipei/zhongshan/background-taipei-zhongshan-thunderstorm-xingtian-temple.webp',
  );
  expect(selection.imageUrl).toBeTruthy();
});

test('randomizes within the same district and weather pool when multiple landmarks are available', () => {
  const manifest = {
    version: 1,
    variants: {
      rain: {
        label_zh: '雨天',
      },
    },
    cities: {
      臺北市: {
        slug: 'taipei',
        districts: {
          中山區: {
            slug: 'zhongshan',
            landmarks: {
              'landmark-a': {
                label_zh: '景點 A',
                variants: {
                  rain: 'taipei/zhongshan/background-taipei-zhongshan-rain-landmark-a.webp',
                },
              },
              'landmark-b': {
                label_zh: '景點 B',
                variants: {
                  rain: 'taipei/zhongshan/background-taipei-zhongshan-rain-landmark-b.webp',
                },
              },
              'landmark-c': {
                label_zh: '景點 C',
                variants: {
                  rain: 'taipei/zhongshan/background-taipei-zhongshan-rain-landmark-c.webp',
                },
              },
            },
            weather_pools: {
              rain: [
                { landmark: 'landmark-a', weight: 1 },
                { landmark: 'landmark-b', weight: 1 },
                { landmark: 'landmark-c', weight: 1 },
              ],
            },
          },
        },
      },
    },
  } as const;

  const assetModules = {
    '../../../images/backgrounds/taipei/zhongshan/background-taipei-zhongshan-rain-landmark-a.webp':
      '/assets/landmark-a.webp',
    '../../../images/backgrounds/taipei/zhongshan/background-taipei-zhongshan-rain-landmark-b.webp':
      '/assets/landmark-b.webp',
    '../../../images/backgrounds/taipei/zhongshan/background-taipei-zhongshan-rain-landmark-c.webp':
      '/assets/landmark-c.webp',
  };

  const lowPick = resolveDistrictBackgroundSelectionFromManifest({
    manifest,
    assetModules,
    location: {
      city: '臺北市',
      district: '中山區',
    },
    variantKey: 'rain',
    randomValue: 0.1,
  });
  const midPick = resolveDistrictBackgroundSelectionFromManifest({
    manifest,
    assetModules,
    location: {
      city: '臺北市',
      district: '中山區',
    },
    variantKey: 'rain',
    randomValue: 0.5,
  });
  const highPick = resolveDistrictBackgroundSelectionFromManifest({
    manifest,
    assetModules,
    location: {
      city: '臺北市',
      district: '中山區',
    },
    variantKey: 'rain',
    randomValue: 0.9,
  });

  expect(lowPick?.sceneLabel).toBe('景點 A');
  expect(midPick?.sceneLabel).toBe('景點 B');
  expect(highPick?.sceneLabel).toBe('景點 C');
});

test('falls back to the shared fantasy background when district assets are unavailable', () => {
  const selection = resolveBackgroundSelection({
    location: {
      city: '臺北市',
      district: '大安區',
    },
    period: thunderstormPeriod,
    randomValue: 0,
  });

  expect(selection.source).toBe('shared');
  expect(selection.sceneLabel).toBe('森林遺跡');
  expect(selection.variantKey).toBe('thunderstorm');
  expect(selection.assetPath).toBe('shared/forest_ruins/thunderstorm.webp');
  expect(selection.imageUrl).toBeTruthy();
});

test('uses the live Zhongshan weather pool to randomize between shipped district landmarks', () => {
  const xingtianPick = resolveBackgroundSelection({
    location: {
      city: '臺北市',
      district: '中山區',
    },
    period: thunderstormPeriod,
    randomValue: 0.1,
  });
  const miramarPick = resolveBackgroundSelection({
    location: {
      city: '臺北市',
      district: '中山區',
    },
    period: thunderstormPeriod,
    randomValue: 0.5,
  });
  const fineArtsPick = resolveBackgroundSelection({
    location: {
      city: '臺北市',
      district: '中山區',
    },
    period: thunderstormPeriod,
    randomValue: 0.9,
  });

  expect(xingtianPick.source).toBe('district');
  expect(xingtianPick.assetPath).toBe(
    'taipei/zhongshan/background-taipei-zhongshan-thunderstorm-xingtian-temple.webp',
  );
  expect(miramarPick.source).toBe('district');
  expect(miramarPick.assetPath).toBe(
    'taipei/zhongshan/background-taipei-zhongshan-thunderstorm-miramar-ferris-wheel.webp',
  );
  expect(fineArtsPick.source).toBe('district');
  expect(fineArtsPick.assetPath).toBe(
    'taipei/zhongshan/background-taipei-zhongshan-thunderstorm-taipei-fine-arts-museum.webp',
  );
});
