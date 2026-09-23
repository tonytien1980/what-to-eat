import { afterEach, expect, test, vi } from 'vitest';
import { buildTownDistrictWeatherSnapshot, loadTaipeiWeatherSnapshot, loadCwaTownDataset } from '../features/weather/cwa-county';
import { cwaTownLocations, resolveCwaTownLocation } from '../features/weather/town-locations';
import { restaurants } from '../features/restaurants/data';

const now = Date.parse('2026-09-23T21:30:00+08:00');
const town = { city: '臺北市', district: '松山區', label: '臺北市松山區', townId: '6300100', countyCode: '63' };
const dataset = () => ({
  timeLabels: Array.from({ length: 28 }, (_, i) => `${String((21 + i) % 24).padStart(2, '0')} 09/${23 + Math.floor((21 + i) / 24)}<br>day`),
  threeHour: { '6300100': { C: { T: Array.from({ length: 28 }, (_, i) => 30 - i / 2), AT: Array(28).fill(32) }, Wx: { C: Array.from({ length: 28 }, () => ['01', '晴'] as [string, string]) } } },
});

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); document.querySelectorAll('script[data-cwa-town-script]').forEach(el => el.remove()); });

test('every current Taipei restaurant district has an official mapping', () => {
  const districts = new Set(restaurants.map(r => r.district));
  for (const district of districts) expect(resolveCwaTownLocation({ city: '台北市', district }), district ?? 'missing district').not.toBeNull();
  expect(cwaTownLocations).toHaveLength(12);
  expect(resolveCwaTownLocation(town)?.townId).toBe('6300100');
});

test('unmapped and city-only locations return no forecast rather than synthetic thunderstorm', async () => {
  expect(await loadTaipeiWeatherSnapshot({ city: '臺北市', district: null })).toBeNull();
  expect(await loadTaipeiWeatherSnapshot({ city: '臺北市', district: '未知區' })).toBeNull();
});

test('selects the time-aligned forecast and future 24 hour temperatures', () => {
  const data = dataset();
  const snapshot = buildTownDistrictWeatherSnapshot(data, town, now);
  expect(snapshot.currentPeriod.currentTemp).toBe(30);
  expect(snapshot.currentPeriod.feelsLikeTemp).toBe(32);
  expect(snapshot.currentPeriod.lowTemp).toBe(18.5);
  expect(snapshot.forecastAt).toBe('2026-09-23T13:00:00.000Z');
  expect(snapshot.validUntil).toBe('2026-09-23T14:00:00.000Z');
  expect(buildTownDistrictWeatherSnapshot(data, town, now + 3600000).currentPeriod.currentTemp).toBe(29.5);
});

test('rejects expired and malformed data, never producing NaN temperatures', () => {
  expect(() => buildTownDistrictWeatherSnapshot(dataset(), town, now + 4 * 86400000)).toThrow(/not current/);
  const data = dataset(); data.threeHour['6300100'].C.AT[0] = NaN;
  expect(() => buildTownDistrictWeatherSnapshot(data, town, now)).toThrow(/Invalid CWA forecast values/);
});

test('resolves December to January in Taiwan time', () => {
  const data = dataset();
  data.timeLabels = Array.from({ length: 28 }, (_, i) => i === 0 ? '23 12/31' : `${String((i - 1) % 24).padStart(2, '0')} 01/${i <= 24 ? '01' : '02'}`);
  const snapshot = buildTownDistrictWeatherSnapshot(data, town, Date.parse('2027-01-01T00:30:00+08:00'));
  expect(snapshot.forecastAt).toBe('2026-12-31T16:00:00.000Z');
});

test('rejects impossible calendar dates instead of normalizing them into a valid forecast', () => {
  const data = dataset();
  data.timeLabels = data.timeLabels.map((_, i) => `${String((21 + i) % 24).padStart(2, '0')} 03/${String(2 + Math.floor((21 + i) / 24)).padStart(2, '0')}`);
  data.timeLabels[0] = '21 02/30';
  expect(() => buildTownDistrictWeatherSnapshot(data, town, Date.parse('2026-03-02T21:30:00+08:00'))).toThrow(/Invalid CWA forecast time/);
});

test('failed CWA requests can retry inside the same cache bucket', async () => {
  vi.resetModules();
  const { loadCwaTownDataset: load } = await import('../features/weather/cwa-county');
  const first = load('63', now);
  const rejected = expect(first).rejects.toThrow();
  document.querySelector<HTMLScriptElement>('script[src*="ChartData_3hr"]')!.dispatchEvent(new Event('error'));
  await rejected;
  const second = load('63', now);
  expect(second).not.toBe(first);
  const retryRejected = expect(second).rejects.toThrow();
  document.querySelector<HTMLScriptElement>('script[src*="ChartData_3hr"]')!.dispatchEvent(new Event('error'));
  await retryRejected;
});

test('a hung script rejects after ten seconds and cleans up', async () => {
  vi.useFakeTimers();
  const pending = loadCwaTownDataset('timeout-test', now);
  const rejected = expect(pending).rejects.toThrow(/timed out/i);
  await vi.advanceTimersByTimeAsync(10000);
  await rejected;
  expect(document.querySelector('script[src*="timeout-test"]')).toBeNull();
});

test('the real location loader returns Songshan data and never requests GT observations', async () => {
  vi.useFakeTimers(); vi.setSystemTime(now);
  vi.resetModules();
  const { loadTaipeiWeatherSnapshot: load } = await import('../features/weather/cwa-county');
  const pending = load(town);
  const data = dataset();
  window.Time_3hr = { C: data.timeLabels };
  window.TempArray_3hr = data.threeHour;
  const scripts = [...document.querySelectorAll<HTMLScriptElement>('script[data-cwa-town-script]')];
  expect(scripts).toHaveLength(1);
  expect(scripts[0].src).toContain('/3hr/');
  scripts[0].dispatchEvent(new Event('load'));
  expect((await pending)?.currentPeriod.wxCode).toBe(1);
  expect((await pending)?.cityName).toBe('臺北市松山區');
  expect(document.querySelector('script[data-cwa-town-script]')).toBeNull();
});
