import {
  getAltarSceneAsset,
  mapWxCodeToVariant,
  pickSceneForPeriod,
  resolveSceneSelection,
} from './scenes';
import type { CwaForecastPeriod, TaipeiWeatherSnapshot } from './types';

export { mapWxCodeToVariant, pickSceneForPeriod, getAltarSceneAsset };

export const CWA_COUNTY_SCRIPT_URL =
  'https://www.cwa.gov.tw/Data/js/TableData_36hr_County_C.js?';

const TAIPEI_CITY_CODE = '63';

interface RawForecastPeriod {
  TimeRange: string;
  Type: 'TD' | 'TN' | 'TM' | 'TMN';
  Temp: {
    C: {
      L: string;
      H: string;
    };
  };
  PoP: string;
  Wx_Icon: string;
  Wx: string;
  CI: string;
}

interface CwaCountyDataset {
  issuedTime: string;
  tableData: Record<string, RawForecastPeriod[]>;
}

declare global {
  interface Window {
    IssuedTime_36hr?: string;
    TableData_36hr?: Record<string, RawForecastPeriod[]>;
  }
}

let countyScriptPromise: Promise<CwaCountyDataset> | null = null;

function toForecastPeriod(period: RawForecastPeriod): CwaForecastPeriod {
  return {
    timeRange: period.TimeRange,
    type: period.Type,
    lowTemp: Number(period.Temp.C.L),
    highTemp: Number(period.Temp.C.H),
    pop: Number(period.PoP),
    wxCode: Number(period.Wx_Icon),
    weatherText: period.Wx,
    comfort: period.CI,
  };
}

export function extractCwaCountyScriptData(scriptText: string): CwaCountyDataset {
  const issuedMatch = scriptText.match(/var IssuedTime_36hr = '([^']+)';/);
  const tableMatch = scriptText.match(/var TableData_36hr = (\{[\s\S]*\});/);

  if (!issuedMatch || !tableMatch) {
    throw new Error('Unable to extract official CWA county forecast data.');
  }

  const tableData = Function(
    '"use strict"; return (' + tableMatch[1] + ');',
  )() as Record<string, RawForecastPeriod[]>;

  return {
    issuedTime: issuedMatch[1],
    tableData,
  };
}

export function buildTaipeiWeatherSnapshot(
  dataset: CwaCountyDataset,
  activeSceneSeed = 0,
): TaipeiWeatherSnapshot {
  const taipeiPeriods = dataset.tableData[TAIPEI_CITY_CODE];

  if (!taipeiPeriods || taipeiPeriods.length === 0) {
    throw new Error('Official CWA dataset did not include Taipei City data.');
  }

  const normalized = taipeiPeriods.map(toForecastPeriod);
  const currentPeriod = normalized[0];

  return {
    cityName: '臺北市',
    issuedTime: dataset.issuedTime,
    sourceLabel: '中央氣象署 36 小時縣市預報',
    currentPeriod,
    upcomingPeriods: normalized.slice(1),
    activeScene: resolveSceneSelection(currentPeriod, activeSceneSeed),
    forecastScenes: normalized.map((period) => resolveSceneSelection(period)),
  };
}

function readGlobalsFromWindow() {
  if (!window.IssuedTime_36hr || !window.TableData_36hr) {
    throw new Error('Official CWA county script loaded without forecast globals.');
  }

  return {
    issuedTime: window.IssuedTime_36hr,
    tableData: window.TableData_36hr,
  };
}

export function loadCwaCountyDataset(): Promise<CwaCountyDataset> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('CWA county loader requires a browser environment.'));
  }

  if (window.IssuedTime_36hr && window.TableData_36hr) {
    return Promise.resolve(readGlobalsFromWindow());
  }

  if (countyScriptPromise) {
    return countyScriptPromise;
  }

  countyScriptPromise = new Promise<CwaCountyDataset>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-cwa-county-script="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(readGlobalsFromWindow()), {
        once: true,
      });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load official CWA county forecast script.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = CWA_COUNTY_SCRIPT_URL;
    script.async = true;
    script.dataset.cwaCountyScript = 'true';
    script.onload = () => {
      try {
        resolve(readGlobalsFromWindow());
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load official CWA county forecast script.'));
    };

    document.head.appendChild(script);
  });

  return countyScriptPromise;
}

export async function loadTaipeiWeatherSnapshot(activeSceneSeed = Math.random()) {
  const dataset = await loadCwaCountyDataset();
  return buildTaipeiWeatherSnapshot(dataset, activeSceneSeed);
}

export function createFallbackTaipeiWeatherSnapshot(activeSceneSeed = 0): TaipeiWeatherSnapshot {
  return {
    cityName: '臺北市',
    issuedTime: '預設模式',
    sourceLabel: '預設備景',
    currentPeriod: {
      timeRange: '今天白天',
      type: 'TD',
      lowTemp: 24,
      highTemp: 28,
      pop: 20,
      wxCode: 5,
      weatherText: '多雲時陰',
      comfort: '舒適',
    },
    upcomingPeriods: [
      {
        timeRange: '今晚明晨',
        type: 'TN',
        lowTemp: 20,
        highTemp: 24,
        pop: 60,
        wxCode: 17,
        weatherText: '陰時多雲短暫陣雨或雷雨',
        comfort: '舒適',
      },
      {
        timeRange: '明天白天',
        type: 'TM',
        lowTemp: 20,
        highTemp: 27,
        pop: 50,
        wxCode: 18,
        weatherText: '陰短暫陣雨或雷雨',
        comfort: '舒適',
      },
    ],
    activeScene: resolveSceneSelection(
      {
        timeRange: '今天白天',
        type: 'TD',
        lowTemp: 24,
        highTemp: 28,
        pop: 20,
        wxCode: 5,
        weatherText: '多雲時陰',
        comfort: '舒適',
      },
      activeSceneSeed,
    ),
    forecastScenes: [
      resolveSceneSelection({
        timeRange: '今天白天',
        type: 'TD',
        lowTemp: 24,
        highTemp: 28,
        pop: 20,
        wxCode: 5,
        weatherText: '多雲時陰',
        comfort: '舒適',
      }),
      resolveSceneSelection({
        timeRange: '今晚明晨',
        type: 'TN',
        lowTemp: 20,
        highTemp: 24,
        pop: 60,
        wxCode: 17,
        weatherText: '陰時多雲短暫陣雨或雷雨',
        comfort: '舒適',
      }),
      resolveSceneSelection({
        timeRange: '明天白天',
        type: 'TM',
        lowTemp: 20,
        highTemp: 27,
        pop: 50,
        wxCode: 18,
        weatherText: '陰短暫陣雨或雷雨',
        comfort: '舒適',
      }),
    ],
  };
}

export const fallbackTaipeiWeatherSnapshot = createFallbackTaipeiWeatherSnapshot();
