import { useEffect, useState } from 'react';
import type { LocationPreference } from '../location/types';
import { loadTaipeiWeatherSnapshot } from './cwa-county';
import type { TaipeiWeatherSnapshot } from './types';

export const WEATHER_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
type WeatherStatus = 'loading' | 'ready' | 'stale' | 'unavailable';

export function useTaipeiWeather(location: Pick<LocationPreference, 'city' | 'district'> | null) {
  const enabled = import.meta.env.MODE !== 'test' || globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__ === true;
  const key = `${location?.city ?? ''}/${location?.district ?? ''}`;
  const [state, setState] = useState<{ key: string; snapshot: TaipeiWeatherSnapshot | null; status: WeatherStatus }>(
    { key, snapshot: null, status: enabled ? 'loading' : 'unavailable' },
  );
  const [refreshTick, setRefreshTick] = useState(0);
  const snapshot = state.key === key ? state.snapshot : null;
  const status: WeatherStatus = snapshot && Date.parse(snapshot.validUntil) <= Date.now()
    ? 'stale' : state.key === key ? state.status : 'loading';

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setRefreshTick(tick => tick + 1);
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    const interval = window.setInterval(refresh, WEATHER_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !snapshot) return;
    const remaining = Date.parse(snapshot.validUntil) - Date.now();
    if (remaining <= 0) return;
    const timeout = window.setTimeout(() => setRefreshTick(tick => tick + 1), remaining);
    return () => window.clearTimeout(timeout);
  }, [enabled, snapshot]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setState(previous => previous.key === key && previous.snapshot
      ? previous : { key, snapshot: null, status: 'loading' });
    loadTaipeiWeatherSnapshot(location).then(next => {
      if (active) setState({ key, snapshot: next, status: next ? 'ready' : 'unavailable' });
    }).catch(() => {
      if (active) setState(previous => ({
        key,
        snapshot: previous.key === key ? previous.snapshot : null,
        status: previous.key === key && previous.snapshot ? 'stale' : 'unavailable',
      }));
    });
    return () => { active = false; };
  }, [enabled, key, location?.city, location?.district, refreshTick]);

  return { snapshot, status };
}
