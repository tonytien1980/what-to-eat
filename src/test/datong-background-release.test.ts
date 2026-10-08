import districtManifest from '../../images/backgrounds/district-manifest.json';
import {
  resolveBackgroundSelection,
  resolveDistrictBackgroundSelectionFromManifest,
} from '../features/backgrounds/selector';
import { resolveCwaTownLocation } from '../features/weather/town-locations';
import type { CwaForecastPeriod } from '../features/weather/types';

const period: CwaForecastPeriod = {
  timeRange: '大同區未來 3 小時',
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
] as const)('resolves Datong %s to the approved Dadaocheng Wharf asset', (variantKey, weatherSlug) => {
  for (const randomValue of [0, 0.5, 0.999999]) {
    const selection = resolveDistrictBackgroundSelectionFromManifest({
      manifest: districtManifest,
      location: { city: '臺北市', district: '大同區' },
      variantKey,
      randomValue,
    });

    expect(selection).toMatchObject({
      source: 'district',
      sceneLabel: '大稻埕碼頭',
      landmarkSlug: 'dadaocheng-wharf',
      districtSlug: 'datong',
      variantKey,
      assetPath: `taipei/datong/background-taipei-datong-${weatherSlug}-dadaocheng-wharf.webp`,
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
] as const)('maps Datong Wx %i through the existing weather contract', (wxCode, variantKey) => {
  expect(resolveBackgroundSelection({
    location: { city: '臺北市', district: '大同區' },
    period: { ...period, wxCode },
  })).toMatchObject({
    source: 'district',
    sceneLabel: '大稻埕碼頭',
    variantKey,
  });
});

test.each(['臺北市', '台北市'])('maps %s Datong to its own CWA forecast', (city) => {
  expect(resolveCwaTownLocation({ city, district: '大同區' })).toEqual({
    city: '臺北市',
    district: '大同區',
    countyCode: '63',
    townId: '6300600',
    label: '臺北市大同區',
  });
});
