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
export const CWA_TOWN_3HR_SCRIPT_URL =
  'https://www.cwa.gov.tw/Data/js/3hr/ChartData_3hr_T_63.js';
export const CWA_TOWN_GT24HR_SCRIPT_URL =
  'https://www.cwa.gov.tw/Data/js/GT/ChartData_GT24hr_T_63.js';

const TAIPEI_CITY_CODE = '63';
const ZHONGSHAN_TOWN_ID = '6300400';

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

type RawTownWxEntry = [string, string];

interface RawTownThreeHourRecord {
  C: {
    T: number[];
    AT: number[];
    Wx: {
      C: RawTownWxEntry[];
    };
  };
}

interface RawTownGtRecord {
  C: {
    T: number[];
    AT: number[];
  };
}

interface CwaTownDataset {
  issuedTime: string;
  gt24hr: Record<string, RawTownGtRecord>;
  threeHour: Record<string, RawTownThreeHourRecord>;
}

declare global {
  interface Window {
    IssuedTime_36hr?: string;
    TableData_36hr?: Record<string, RawForecastPeriod[]>;
    TempArray_3hr?: Record<string, RawTownThreeHourRecord>;
    TempArray_GT24hr?: Record<string, RawTownGtRecord>;
  }
}

let countyScriptPromise: Promise<CwaCountyDataset> | null = null;
let townScriptPromise: Promise<CwaTownDataset> | null = null;

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

function stripHtmlTags(text: string) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractUpdatedTime(scriptText: string) {
  const updatedMatch = scriptText.match(/Updated:\s*([0-9/: ]+)/);
  return updatedMatch?.[1]?.trim() ?? '官方鄉鎮預報';
}

function deriveComfortFromFeelsLike(feelsLikeTemp: number) {
  if (feelsLikeTemp <= 20) {
    return '偏涼';
  }

  if (feelsLikeTemp <= 26) {
    return '舒適';
  }

  if (feelsLikeTemp <= 31) {
    return '溫暖';
  }

  return '炎熱';
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

export function extractCwaTownScriptData({
  threeHourScript,
  gt24hrScript,
}: {
  gt24hrScript: string;
  threeHourScript: string;
}): CwaTownDataset {
  const threeHourMatch = threeHourScript.match(/var TempArray_3hr = (\{[\s\S]*\});/);
  const gt24hrMatch = gt24hrScript.match(/var TempArray_GT24hr = (\{[\s\S]*\});/);

  if (!threeHourMatch || !gt24hrMatch) {
    throw new Error('Unable to extract official CWA town forecast data.');
  }

  const threeHour = Function(
    '"use strict"; return (' + threeHourMatch[1] + ');',
  )() as Record<string, RawTownThreeHourRecord>;
  const gt24hr = Function(
    '"use strict"; return (' + gt24hrMatch[1] + ');',
  )() as Record<string, RawTownGtRecord>;

  return {
    issuedTime: extractUpdatedTime(threeHourScript),
    threeHour,
    gt24hr,
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

export function buildZhongshanDistrictWeatherSnapshot(
  dataset: CwaTownDataset,
  activeSceneSeed = 0,
): TaipeiWeatherSnapshot {
  const threeHourRecord = dataset.threeHour[ZHONGSHAN_TOWN_ID];
  const gt24hrRecord = dataset.gt24hr[ZHONGSHAN_TOWN_ID];

  if (!threeHourRecord || !gt24hrRecord) {
    throw new Error('Official CWA town dataset did not include Zhongshan District data.');
  }

  const nextDayTemps = threeHourRecord.C.T.slice(0, 24);
  const currentTemp = threeHourRecord.C.T[0];
  const wxEntry = threeHourRecord.C.Wx.C[0];
  const feelsLikeTemp =
    gt24hrRecord.C.AT[gt24hrRecord.C.AT.length - 1] ?? threeHourRecord.C.AT[0];

  const currentPeriod: CwaForecastPeriod = {
    timeRange: stripHtmlTags('中山區未來 24 小時'),
    type: '3hr',
    lowTemp: Math.min(...nextDayTemps),
    highTemp: Math.max(...nextDayTemps),
    pop: 0,
    wxCode: Number(wxEntry[0]),
    weatherText: wxEntry[1],
    comfort: deriveComfortFromFeelsLike(feelsLikeTemp),
    currentTemp,
    feelsLikeTemp,
  };

  const upcomingPeriods = threeHourRecord.C.Wx.C.slice(1, 4).map((entry, index) => {
    const tempIndex = index + 1;
    const periodTemp = threeHourRecord.C.T[tempIndex];
    const periodFeelsLike = threeHourRecord.C.AT[tempIndex];

    return {
      timeRange: stripHtmlTags(`中山區 ${tempIndex + 1} 小時後`),
      type: '3hr' as const,
      lowTemp: periodTemp,
      highTemp: periodTemp,
      pop: 0,
      wxCode: Number(entry[0]),
      weatherText: entry[1],
      comfort: deriveComfortFromFeelsLike(periodFeelsLike),
      currentTemp: periodTemp,
      feelsLikeTemp: periodFeelsLike,
    };
  });

  return {
    cityName: '臺北市中山區',
    issuedTime: dataset.issuedTime,
    sourceLabel: '中央氣象署中山區 3 小時鄉鎮預報',
    currentPeriod,
    upcomingPeriods,
    activeScene: resolveSceneSelection(currentPeriod, activeSceneSeed),
    forecastScenes: [currentPeriod, ...upcomingPeriods].map((period) =>
      resolveSceneSelection(period),
    ),
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

function readTownGlobalsFromWindow() {
  if (!window.TempArray_3hr || !window.TempArray_GT24hr) {
    throw new Error('Official CWA town scripts loaded without forecast globals.');
  }

  return {
    issuedTime: '官方中山區鄉鎮預報',
    threeHour: window.TempArray_3hr,
    gt24hr: window.TempArray_GT24hr,
  };
}

function loadScriptOnce(selector: string, url: string, dataAttributeName: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(selector);

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error(`Failed to load ${url}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.setAttribute(dataAttributeName, 'true');
    script.dataset.loaded = 'false';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${url}`));

    document.head.appendChild(script);
  });
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
  const dataset = await loadCwaTownDataset();
  return buildZhongshanDistrictWeatherSnapshot(dataset, activeSceneSeed);
}

export function loadCwaTownDataset(): Promise<CwaTownDataset> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('CWA town loader requires a browser environment.'));
  }

  if (window.TempArray_3hr && window.TempArray_GT24hr) {
    return Promise.resolve(readTownGlobalsFromWindow());
  }

  if (townScriptPromise) {
    return townScriptPromise;
  }

  townScriptPromise = Promise.all([
    loadScriptOnce(
      'script[data-cwa-town-3hr-script="true"]',
      CWA_TOWN_3HR_SCRIPT_URL,
      'data-cwa-town-3hr-script',
    ),
    loadScriptOnce(
      'script[data-cwa-town-gt24hr-script="true"]',
      CWA_TOWN_GT24HR_SCRIPT_URL,
      'data-cwa-town-gt24hr-script',
    ),
  ]).then(() => readTownGlobalsFromWindow());

  return townScriptPromise;
}

export function createFallbackTaipeiWeatherSnapshot(activeSceneSeed = 0): TaipeiWeatherSnapshot {
  const currentPeriod: CwaForecastPeriod = {
    timeRange: '中山區未來 24 小時',
    type: '3hr',
    lowTemp: 20,
    highTemp: 27,
    pop: 0,
    wxCode: 15,
    weatherText: '短暫陣雨或雷雨',
    comfort: '舒適',
    currentTemp: 22,
    feelsLikeTemp: 24,
  };

  const upcomingPeriods: CwaForecastPeriod[] = [
    {
      timeRange: '中山區 2 小時後',
      type: '3hr',
      lowTemp: 23,
      highTemp: 23,
      pop: 0,
      wxCode: 7,
      weatherText: '陰',
      comfort: '舒適',
      currentTemp: 23,
      feelsLikeTemp: 25,
    },
    {
      timeRange: '中山區 3 小時後',
      type: '3hr',
      lowTemp: 24,
      highTemp: 24,
      pop: 0,
      wxCode: 4,
      weatherText: '多雲',
      comfort: '舒適',
      currentTemp: 24,
      feelsLikeTemp: 26,
    },
  ];

  return {
    cityName: '臺北市中山區',
    issuedTime: '預設模式',
    sourceLabel: '中央氣象署中山區 3 小時鄉鎮預報',
    currentPeriod,
    upcomingPeriods,
    activeScene: resolveSceneSelection(currentPeriod, activeSceneSeed),
    forecastScenes: [currentPeriod, ...upcomingPeriods].map((period) =>
      resolveSceneSelection(period),
    ),
  };
}

export const fallbackTaipeiWeatherSnapshot = createFallbackTaipeiWeatherSnapshot();
