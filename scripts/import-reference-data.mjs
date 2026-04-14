import { readFile, writeFile } from 'node:fs/promises';

const sourceSheets = JSON.parse(
  await readFile(new URL('../data/restaurant-sheet-sources.json', import.meta.url), 'utf8'),
);
const DEFAULT_LOCATION_CITY = '臺北市';
const DEFAULT_LOCATION_DISTRICT = '中山區';

function parseCsv(text) {
  const rows = [];
  let row = [];
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

  const parseOptionalNumber = (value) => {
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

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[\s/・‧\.＿_]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

function hash(input) {
  let value = 0;

  for (const char of input) {
    value = (value * 31 + char.codePointAt(0)) % 2147483647;
  }

  return value;
}

function inferPriceLevel(name, category) {
  if (category === 'drinks' || category === 'sweets') {
    return 'low';
  }

  if (/(麻辣|鍋|義大利麵|pasta|和風|餐酒)/i.test(name)) {
    return 'high';
  }

  if (/(便當|擔仔麵|水餃|麵食|麵|飯|小吃)/i.test(name)) {
    return 'low';
  }

  return 'medium';
}

function inferDistanceLevel(name) {
  const levels = ['near', 'mid', 'far'];
  return levels[hash(name) % levels.length];
}

function inferTags(name, category) {
  const tags = new Set([category]);

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

  const keywordMap = [
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

async function loadSourceSheet(category, url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${category}: ${response.status}`);
  }

  const text = await response.text();
  const rows = parseCsv(text);

  return rows.map((row, index) => ({
    id: `${category}-${slugify(row.name) || `entry-${index + 1}`}`,
    name: row.name,
    category,
    mapUrl: row.mapUrl,
    placeId: row.placeId,
    lat: row.lat,
    lng: row.lng,
    tags: inferTags(row.name, category),
    priceLevel: inferPriceLevel(row.name, category),
    distanceLevel: inferDistanceLevel(`${category}-${row.name}`),
    city: row.city ?? DEFAULT_LOCATION_CITY,
    district: row.district ?? DEFAULT_LOCATION_DISTRICT,
    isEnabled: true,
  }));
}

async function main() {
  const imports = await Promise.all(
    sourceSheets.map((sheet) => loadSourceSheet(sheet.category, sheet.url)),
  );
  const records = imports.flat();

  await writeFile(
    new URL('../data/restaurants.json', import.meta.url),
    `${JSON.stringify(records, null, 2)}\n`,
    'utf8',
  );

  const summary = imports
    .map((items, index) => `${sourceSheets[index].category}: ${items.length}`)
    .join(', ');

  console.log(`Imported ${records.length} restaurants (${summary})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
