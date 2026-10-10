import { createCwaTownScriptCacheKey, createCwaTownScriptUrl } from '../features/weather/cwa-county';
import { mapWxCodeToVariant, pickSceneForPeriod } from '../features/weather/scenes';
import { resolveBackgroundSelection } from '../features/backgrounds/selector';

test('uses fifteen minute buckets for the canonical town forecast request', () => {
  const now = Date.UTC(2026, 3, 12, 0, 45, 0);
  expect(createCwaTownScriptUrl('63', now)).toBe('https://www.cwa.gov.tw/Data/js/3hr/ChartData_3hr_T_63.js?t=1973283');
  expect(createCwaTownScriptCacheKey('63', now)).toBe('63:1973283');
  expect(createCwaTownScriptCacheKey('63', now + 15 * 60000)).toBe('63:1973284');
});

test('maps real thunderstorm forecasts to compatible shared scenes', () => {
  const period = { wxCode: 17, highTemp: 25, lowTemp: 20, type: '3hr' as const, weatherText: '雷雨', timeRange: '21:00' };
  expect(mapWxCodeToVariant(17)).toBe('thunderstorm');
  expect(pickSceneForPeriod(period)).toBe('forest_ruins');
  expect(pickSceneForPeriod(period, 0.999)).toBe('floating_isles');
});

test('unknown weather uses neutral artwork instead of invented weather', () => {
  const selected = resolveBackgroundSelection({ location: { city: '臺北市', district: '松山區' }, period: null });
  expect(selected.source).toBe('shared');
  expect(selected.variantKey).toBe('default');
  expect(selected.variantLabel).toBe('天氣未確認');
  expect(selected.imageUrl).toBeTruthy();
});

test('a forecast without matching artwork keeps the official weather text, not a hardcoded district', () => {
  const selected = resolveBackgroundSelection({
    location: { city: '臺北市', district: '松山區' },
    period: { wxCode: 19, weatherText: '晴午後短暫陣雨', highTemp: 27, lowTemp: 23, type: '3hr', timeRange: '00:00' },
  });
  expect(selected.source).toBe('shared');
  expect(selected.variantKey).toBe('default');
  expect(selected.variantLabel).toBe('晴午後短暫陣雨');
  expect(selected.imageUrl).toBeTruthy();
});
