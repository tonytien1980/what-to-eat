import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useTaipeiWeather, WEATHER_REFRESH_INTERVAL_MS } from '../features/weather/useTaipeiWeather';

const loader = vi.hoisted(() => vi.fn());
vi.mock('../features/weather/cwa-county', async (original) => ({ ...await original<object>(), loadTaipeiWeatherSnapshot: loader }));
const location = { city: '臺北市', district: '松山區' };
const snapshot = {
  cityName: '臺北市松山區', forecastAt: '2026-09-23T13:00:00.000Z', validUntil: '2026-09-23T14:00:00.000Z',
  currentPeriod: { type: '3hr', timeRange: '21:00', wxCode: 1, weatherText: '晴', currentTemp: 27, feelsLikeTemp: 29, lowTemp: 24, highTemp: 29 },
};

beforeEach(() => {
  globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__ = true;
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-23T13:30:00Z'));
  loader.mockReset();
});
afterEach(() => { delete globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__; vi.useRealTimers(); });

test('refreshes on focus and interval, retaining last-good while a refresh fails', async () => {
  loader.mockResolvedValueOnce(snapshot).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(snapshot);
  const { result } = renderHook(() => useTaipeiWeather(location));
  await act(async () => {});
  expect(result.current.status).toBe('ready');
  await act(async () => { window.dispatchEvent(new Event('focus')); });
  expect(result.current.snapshot).toEqual(snapshot);
  expect(result.current.status).toBe('stale');
  await act(async () => { vi.advanceTimersByTime(WEATHER_REFRESH_INTERVAL_MS); });
  expect(result.current.status).toBe('ready');
  expect(loader).toHaveBeenCalledTimes(3);
});

test('does not retain weather from another district or accept its late response', async () => {
  let finishOld!: (value: typeof snapshot) => void;
  loader.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; })).mockResolvedValueOnce(null);
  const { result, rerender } = renderHook(({ district }) => useTaipeiWeather({ city: '臺北市', district }), { initialProps: { district: '松山區' } });
  rerender({ district: '未知區' });
  await act(async () => {});
  expect(result.current.snapshot).toBeNull();
  expect(result.current.status).toBe('unavailable');
  await act(async () => { finishOld(snapshot); });
  expect(result.current.snapshot).toBeNull();
});

test('clears a loaded district immediately on location change', async () => {
  loader.mockResolvedValueOnce(snapshot).mockImplementationOnce(() => new Promise(() => {}));
  const { result, rerender } = renderHook(({ district }) => useTaipeiWeather({ city: '臺北市', district }), { initialProps: { district: '松山區' } });
  await act(async () => {});
  rerender({ district: '中山區' });
  expect(result.current.snapshot).toBeNull();
  expect(result.current.status).toBe('loading');
});

test('marks expired forecasts stale while refresh is still pending', async () => {
  loader.mockResolvedValueOnce(snapshot).mockImplementation(() => new Promise(() => {}));
  const { result } = renderHook(() => useTaipeiWeather(location));
  await act(async () => {});
  await act(async () => { vi.advanceTimersByTime(31 * 60000); });
  expect(result.current.status).toBe('stale');
  expect(result.current.snapshot).toEqual(snapshot);
});
