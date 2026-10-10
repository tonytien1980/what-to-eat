import type { LocationPreference } from '../location/types';
import { type CwaTownLocation, resolveCwaTownLocation } from './town-locations';
import type { TaipeiWeatherSnapshot } from './types';

export const CWA_SCRIPT_CACHE_WINDOW_MS = 15 * 60 * 1000;
export const CWA_SCRIPT_TIMEOUT_MS = 10000;
const HOUR_MS = 60 * 60 * 1000;
const MAX_SOURCE_AGE_MS = 3 * HOUR_MS;

interface RawTownRecord {
  C: { T: number[]; AT: number[] };
  Wx: { C: [string, string][] };
}

export interface CwaTownDataset {
  timeLabels: string[];
  threeHour: Record<string, RawTownRecord>;
}

declare global {
  interface Window {
    Time_3hr?: { C: string[] };
    TempArray_3hr?: Record<string, RawTownRecord>;
  }
}

// One bounded cache, shared by districts in the same county. Failures are not cached.
let scriptCache: { key: string; promise: Promise<CwaTownDataset> } | null = null;

export function createCwaTownScriptCacheKey(countyCode: string, now = Date.now()) {
  return `${countyCode}:${Math.floor(now / CWA_SCRIPT_CACHE_WINDOW_MS)}`;
}

export function createCwaTownScriptUrl(countyCode: string, now = Date.now()) {
  return `https://www.cwa.gov.tw/Data/js/3hr/ChartData_3hr_T_${countyCode}.js?t=${Math.floor(now / CWA_SCRIPT_CACHE_WINDOW_MS)}`;
}

function forecastTimes(labels: string[], now: number) {
  const year = new Date(now + 8 * HOUR_MS).getUTCFullYear();
  return labels.map((label, index) => {
    const match = /^(\d{2}) (\d{2})\/(\d{2})/.exec(label);
    if (!match) throw new Error('Invalid CWA forecast time.');
    const [, hour, month, day] = match.map(Number);
    if (hour > 23 || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('Invalid CWA forecast time.');
    }
    // The source omits the year. Resolve it relative to Taiwan time, including New Year.
    const candidates = [year - 1, year, year + 1].map(y => Date.UTC(y, month - 1, day, hour - 8));
    const reference = now + index * HOUR_MS;
    const selected = candidates.sort((a, b) => Math.abs(a - reference) - Math.abs(b - reference))[0];
    const localDate = new Date(selected + 8 * HOUR_MS);
    if (localDate.getUTCMonth() + 1 !== month || localDate.getUTCDate() !== day) {
      throw new Error('Invalid CWA forecast time.');
    }
    return selected;
  });
}

export function buildTownDistrictWeatherSnapshot(
  dataset: CwaTownDataset,
  town: CwaTownLocation,
  now = Date.now(),
): TaipeiWeatherSnapshot {
  const record = dataset.threeHour[town.townId];
  const times = forecastTimes(dataset.timeLabels, now);
  if (!record || times.length < 2 || times.some((time, i) => i > 0 && time <= times[i - 1])) {
    throw new Error('Missing or invalid CWA town forecast.');
  }
  if (times[0] > now || now - times[0] >= MAX_SOURCE_AGE_MS) {
    throw new Error('CWA forecast is not current.');
  }
  const index = times.findIndex((time, i) => time <= now && times[i + 1] > now);
  if (index < 0) throw new Error('CWA forecast has expired.');
  const windowEnd = times[index] + 24 * HOUR_MS;
  if (times[times.length - 1] < windowEnd) throw new Error('Incomplete CWA temperature window.');
  const temperatures = times.flatMap((time, i) => time >= times[index] && time < windowEnd ? [record.C.T[i]] : []);
  const currentTemp = record.C.T[index];
  const feelsLikeTemp = record.C.AT[index];
  const wx = record.Wx?.C[index];
  const wxCode = Number(wx?.[0]);
  if (![...temperatures, currentTemp, feelsLikeTemp].every(value => typeof value === 'number' && Number.isFinite(value)) ||
      !wx?.[1]?.trim() || !Number.isInteger(wxCode) || wxCode < 1 || wxCode > 42) {
    throw new Error('Invalid CWA forecast values.');
  }
  return {
    cityName: town.label,
    forecastAt: new Date(times[index]).toISOString(),
    validUntil: new Date(times[index + 1]).toISOString(),
    currentPeriod: {
      type: '3hr',
      timeRange: `${town.district}未來 24 小時`,
      lowTemp: Math.min(...temperatures),
      highTemp: Math.max(...temperatures),
      currentTemp,
      feelsLikeTemp,
      wxCode,
      weatherText: wx[1],
    },
  };
}

export function loadCwaTownDataset(countyCode: string, now = Date.now()): Promise<CwaTownDataset> {
  const key = createCwaTownScriptCacheKey(countyCode, now);
  if (scriptCache?.key === key) return scriptCache.promise;
  const promise = new Promise<CwaTownDataset>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = createCwaTownScriptUrl(countyCode, now);
    script.async = true;
    script.dataset.cwaTownScript = key;
    const finish = () => {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      script.remove();
      window.Time_3hr = undefined;
      window.TempArray_3hr = undefined;
    };
    const timeout = window.setTimeout(() => {
      finish();
      reject(new Error('CWA forecast request timed out.'));
    }, CWA_SCRIPT_TIMEOUT_MS);
    script.onload = () => {
      const timeLabels = window.Time_3hr?.C;
      const threeHour = window.TempArray_3hr;
      finish();
      if (!Array.isArray(timeLabels) || !threeHour) {
        reject(new Error('CWA script did not provide forecast data.'));
      } else {
        resolve({ timeLabels, threeHour });
      }
    };
    script.onerror = () => {
      finish();
      reject(new Error('Failed to load CWA forecast.'));
    };
    window.Time_3hr = undefined;
    window.TempArray_3hr = undefined;
    document.head.appendChild(script);
  });
  scriptCache = { key, promise };
  void promise.catch(() => { if (scriptCache?.promise === promise) scriptCache = null; });
  return promise;
}

export async function loadTaipeiWeatherSnapshot(
  location: Pick<LocationPreference, 'city' | 'district'> | null,
) {
  const town = resolveCwaTownLocation(location);
  if (!town) return null;
  const request = loadCwaTownDataset(town.countyCode);
  try {
    return buildTownDistrictWeatherSnapshot(await request, town);
  } catch (error) {
    if (scriptCache?.promise === request) scriptCache = null;
    throw error;
  }
}
