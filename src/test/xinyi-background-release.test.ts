import districtManifest from '../../images/backgrounds/district-manifest.json';
import {
  resolveBackgroundSelection,
  resolveDistrictBackgroundSelectionFromManifest,
} from '../features/backgrounds/selector';
import { resolveCwaTownLocation } from '../features/weather/town-locations';
import type { CwaForecastPeriod } from '../features/weather/types';

const period: CwaForecastPeriod = {
  timeRange: '信義區未來 3 小時',
  type: '3hr',
  lowTemp: 20,
  highTemp: 27,
  pop: 20,
  wxCode: 1,
  weatherText: '晴',
  comfort: '舒適',
};

test.each([
  ['clear_cloudy', 'clear-cloudy'],
  ['overcast', 'overcast'],
  ['rain', 'rain'],
  ['heavy_rain', 'heavy-rain'],
  ['thunderstorm', 'thunderstorm'],
  ['dense_fog', 'dense-fog'],
] as const)('resolves Xinyi %s to the approved Taipei 101 asset', (variantKey, weatherSlug) => {
  for (const randomValue of [0, 0.5, 0.999999]) {
    const selection = resolveDistrictBackgroundSelectionFromManifest({
      manifest: districtManifest,
      location: { city: '臺北市', district: '信義區' },
      variantKey,
      randomValue,
    });

    expect(selection).toMatchObject({
      source: 'district',
      sceneLabel: '台北101',
      landmarkSlug: 'taipei-101',
      districtSlug: 'xinyi',
      variantKey,
      assetPath: `taipei/xinyi/background-taipei-xinyi-${weatherSlug}-taipei-101.webp`,
    });
    expect(selection?.imageUrl).toBeTruthy();
  }
});

test.each([
  [1, 'clear_cloudy'],
  [7, 'overcast'],
  [8, 'rain'],
  [15, 'thunderstorm'],
  [31, 'dense_fog'],
] as const)('maps Xinyi Wx %i through the existing weather contract', (wxCode, variantKey) => {
  expect(resolveBackgroundSelection({
    location: { city: '臺北市', district: '信義區' },
    period: { ...period, wxCode },
  })).toMatchObject({
    source: 'district',
    sceneLabel: '台北101',
    variantKey,
  });
});

test.each(['臺北市', '台北市'])('maps %s Xinyi to its own CWA forecast', (city) => {
  expect(resolveCwaTownLocation({ city, district: '信義區' })).toEqual({
    city: '臺北市',
    district: '信義區',
    countyCode: '63',
    townId: '6300200',
    label: '臺北市信義區',
  });
});
