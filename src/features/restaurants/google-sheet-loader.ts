import type { Category, RestaurantCatalogResult, RestaurantRecord, RestaurantSheetSource } from './types';
import {
  DEFAULT_LOCATION_CITY,
  DEFAULT_LOCATION_DISTRICT,
} from '../location/constants';

type Fetcher = typeof fetch;

interface SheetRow {
  name: string;
  mapUrl: string;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
}

interface ResolveRestaurantCatalogOptions {
  fallbackRestaurants: RestaurantRecord[];
  fetcher?: Fetcher;
  sources: RestaurantSheetSource[];
}

export function parsePublishedSheetCsv(text: string): SheetRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let index = 0;
  let isQuoted = false;

  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (isQuoted && next === '"') {
        cell += '"';
        index += 2;
        continue;
      }

      isQuoted = !isQuoted;
      index += 1;
      continue;
    }

    if (!isQuoted && char === ',') {
      row.push(cell.trim());
      cell = '';
      index += 1;
      continue;
    }

    if (!isQuoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }

      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }

      row = [];
      cell = '';
      index += 1;
      continue;
    }

    cell += char;
    index += 1;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  const [headerRow = [], ...dataRows] = rows;
  const normalizedHeaders = headerRow.map((header) => header.trim().toLowerCase());
  const nameIndex = normalizedHeaders.indexOf('shop');
  const mapUrlIndex = normalizedHeaders.indexOf('maplink');
  const cityIndex = normalizedHeaders.indexOf('city');
  const districtIndex = normalizedHeaders.indexOf('district');
  const latIndex = normalizedHeaders.indexOf('lat');
  const lngIndex = normalizedHeaders.indexOf('lng');
  const placeIdIndex = normalizedHeaders.indexOf('placeid');

  if (nameIndex === -1 || mapUrlIndex === -1) {
    return [];
  }

  const parseOptionalNumber = (value?: string) => {
    if (!value) {
      return null;
    }

    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  };

  return dataRows
    .map((dataRow) => ({
      name: dataRow[nameIndex] ?? '',
      mapUrl: dataRow[mapUrlIndex] ?? '',
      city: dataRow[cityIndex]?.trim() || null,
      district: dataRow[districtIndex]?.trim() || null,
      lat: parseOptionalNumber(dataRow[latIndex]),
      lng: parseOptionalNumber(dataRow[lngIndex]),
      placeId: dataRow[placeIdIndex]?.trim() || null,
    }))
    .filter((row) => row.name && row.mapUrl);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[\s/・‧\.＿_]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

function hash(input: string) {
  let value = 0;

  for (const char of input) {
    value = (value * 31 + char.codePointAt(0)!) % 2147483647;
  }

  return value;
}

function inferPriceLevel(name: string, category: Category) {
  if (category === 'drinks' || category === 'sweets') {
    return 'low' as const;
  }

  if (/(麻辣|鍋|義大利麵|pasta|和風|餐酒)/i.test(name)) {
    return 'high' as const;
  }

  if (/(便當|擔仔麵|水餃|麵食|麵|飯|小吃)/i.test(name)) {
    return 'low' as const;
  }

  return 'medium' as const;
}

function inferDistanceLevel(name: string) {
  const levels = ['near', 'mid', 'far'] as const;
  return levels[hash(name) % levels.length];
}

function inferTags(name: string, category: Category) {
  const tags = new Set<string>([category]);

  if (category === 'lunch' || category === 'dinner') {
    tags.add('meal');
    tags.add('hot');
  }

  if (category === 'drinks') {
    tags.add('drink');
    tags.add('tea');
    tags.add('cold');
  }

  if (category === 'sweets') {
    tags.add('dessert');
    tags.add('sweet');
  }

  const keywordMap: Array<[RegExp, string]> = [
    [/飯|便當/u, 'rice'],
    [/麵|義大利麵|pasta/i, 'noodle'],
    [/水餃/u, 'dumpling'],
    [/茶|紅茶|奶茶/u, 'tea'],
    [/冰|冰沙/u, 'cold'],
    [/湯圓|熱/u, 'hot'],
    [/蛋糕|麻糬/u, 'snack'],
    [/甜/u, 'sweet'],
    [/辣|麻辣/u, 'spicy'],
    [/炸/u, 'fried'],
  ];

  for (const [pattern, tag] of keywordMap) {
    if (pattern.test(name)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

async function loadSourceSheet(
  source: RestaurantSheetSource,
  fetcher: Fetcher,
) {
  const response = await fetcher(source.url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.category}: ${response.status}`);
  }

  const text = await response.text();
  const rows = parsePublishedSheetCsv(text);

  return rows.map((row, index) => ({
    id: `${source.category}-${slugify(row.name) || `entry-${index + 1}`}`,
    name: row.name,
    category: source.category,
    mapUrl: row.mapUrl,
    placeId: row.placeId,
    lat: row.lat,
    lng: row.lng,
    tags: inferTags(row.name, source.category),
    priceLevel: inferPriceLevel(row.name, source.category),
    distanceLevel: inferDistanceLevel(`${source.category}-${row.name}`),
    city: row.city ?? DEFAULT_LOCATION_CITY,
    district: row.district ?? DEFAULT_LOCATION_DISTRICT,
    isEnabled: true,
  }));
}

async function fetchRestaurantsFromSheets(
  sources: RestaurantSheetSource[],
  fetcher: Fetcher,
) {
  const imports = await Promise.all(
    sources.map((source) => loadSourceSheet(source, fetcher)),
  );

  return imports.flat();
}

export async function resolveRestaurantCatalog({
  fallbackRestaurants,
  fetcher = fetch,
  sources,
}: ResolveRestaurantCatalogOptions): Promise<RestaurantCatalogResult> {
  try {
    if (typeof fetcher !== 'function') {
      throw new Error('fetch unavailable');
    }

    const restaurants = await fetchRestaurantsFromSheets(sources, fetcher);

    if (restaurants.length === 0) {
      throw new Error('empty catalog');
    }

    return {
      restaurants,
      sourceLabel: 'Google Sheet 即時資料',
      status: 'live',
    };
  } catch {
    return {
      restaurants: fallbackRestaurants,
      sourceLabel: '本地快照備援',
      status: 'fallback',
    };
  }
}
