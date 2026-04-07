import { useEffect, useState } from 'react';
import type { LocationPreference } from '../location/types';
import {
  createFallbackTaipeiWeatherSnapshot,
  loadTaipeiWeatherSnapshot,
} from './cwa-county';
import type { TaipeiWeatherSnapshot } from './types';

export function useTaipeiWeather(
  location: Pick<LocationPreference, 'city' | 'district'> | null,
) {
  const [snapshot, setSnapshot] = useState<TaipeiWeatherSnapshot>(() =>
    import.meta.env.MODE === 'test'
      ? createFallbackTaipeiWeatherSnapshot(location)
      : createFallbackTaipeiWeatherSnapshot(location, Math.random()),
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    import.meta.env.MODE === 'test' ? 'ready' : 'loading',
  );

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
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
  }, [location?.city, location?.district]);

  return {
    snapshot,
    status,
  };
}
