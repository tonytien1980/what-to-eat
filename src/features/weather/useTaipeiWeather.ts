import { useEffect, useState } from 'react';
import {
  createFallbackTaipeiWeatherSnapshot,
  fallbackTaipeiWeatherSnapshot,
  loadTaipeiWeatherSnapshot,
} from './cwa-county';
import type { TaipeiWeatherSnapshot } from './types';

export function useTaipeiWeather() {
  const [snapshot, setSnapshot] = useState<TaipeiWeatherSnapshot>(() =>
    import.meta.env.MODE === 'test'
      ? fallbackTaipeiWeatherSnapshot
      : createFallbackTaipeiWeatherSnapshot(Math.random()),
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    import.meta.env.MODE === 'test' ? 'ready' : 'loading',
  );

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return;
    }

    let isCancelled = false;

    loadTaipeiWeatherSnapshot(Math.random())
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
  }, []);

  return {
    snapshot,
    status,
  };
}
