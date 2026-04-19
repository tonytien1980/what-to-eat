import { useEffect, useState } from 'react';
import type { LocationPreference } from '../location/types';
import {
  createFallbackTaipeiWeatherSnapshot,
  loadTaipeiWeatherSnapshot,
} from './cwa-county';
import type { TaipeiWeatherSnapshot } from './types';

export const WEATHER_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useTaipeiWeather(
  location: Pick<LocationPreference, 'city' | 'district'> | null,
) {
  const liveWeatherEnabled =
    import.meta.env.MODE !== 'test' || globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__ === true;
  const [snapshot, setSnapshot] = useState<TaipeiWeatherSnapshot>(() =>
    import.meta.env.MODE === 'test'
      ? createFallbackTaipeiWeatherSnapshot(location)
      : createFallbackTaipeiWeatherSnapshot(location, Math.random()),
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    import.meta.env.MODE === 'test' ? 'ready' : 'loading',
  );
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!liveWeatherEnabled || typeof window === 'undefined') {
      return;
    }

    const refreshWeather = () => {
      setRefreshTick((previous) => previous + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshWeather();
      }
    };

    const intervalId = window.setInterval(
      refreshWeather,
      WEATHER_REFRESH_INTERVAL_MS,
    );

    window.addEventListener('focus', refreshWeather);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWeather);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [liveWeatherEnabled]);

  useEffect(() => {
    if (!liveWeatherEnabled) {
      return;
    }

    let isCancelled = false;
    setStatus('loading');
    setSnapshot(createFallbackTaipeiWeatherSnapshot(location, Math.random()));

    loadTaipeiWeatherSnapshot(location, Math.random())
      .then((nextSnapshot) => {
        if (isCancelled) {
          return;
        }

        setSnapshot(nextSnapshot);
        setStatus('ready');
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setStatus('error');
      });

    return () => {
      isCancelled = true;
    };
  }, [liveWeatherEnabled, location?.city, location?.district, refreshTick]);

  return {
    snapshot,
    status,
  };
}
