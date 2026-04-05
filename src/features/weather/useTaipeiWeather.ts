import { useEffect, useState } from 'react';
import {
  fallbackTaipeiWeatherSnapshot,
  loadTaipeiWeatherSnapshot,
} from './cwa-county';
import type { TaipeiWeatherSnapshot } from './types';

export function useTaipeiWeather() {
  const [snapshot, setSnapshot] = useState<TaipeiWeatherSnapshot>(
    fallbackTaipeiWeatherSnapshot,
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    import.meta.env.MODE === 'test' ? 'ready' : 'loading',
  );

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return;
    }

    let isCancelled = false;

    loadTaipeiWeatherSnapshot()
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
