import { mkdir, writeFile } from 'node:fs/promises';

const MASTER_SPREADSHEET_ID = '11Q8TfeTjvOuDwgX9Ux1kG91pahFcfjC1hA4VO0k4KdM';
const MASTER_SHEET_GID = '0';
const OUTPUT_DIR = new URL('../output/master-publish-preview/', import.meta.url);

const CATEGORY_TAB_MAP = {
  lunch: '午餐',
  dinner: '晚餐',
  drinks: '飲料',
  sweets: '甜點',
};

const PUBLISH_HEADERS = ['shop', 'maplink', 'city', 'district', 'lat', 'lng', 'placeid'];

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

  return rows;
}

function parseOptionalNumber(value) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  return ['true', '1', 'yes', 'y'].includes(normalized);
}

function normalizeText(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function parseMasterRows(rows) {
  const [headerRow = [], ...dataRows] = rows;
  const normalizedHeaders = headerRow.map((header) => String(header).trim().toLowerCase());
  const indexOf = (name) => normalizedHeaders.indexOf(name);

  const shopIndex = indexOf('shop');
  const maplinkIndex = indexOf('maplink');

  if (shopIndex === -1 || maplinkIndex === -1) {
    throw new Error('Master sheet header is missing shop/maplink');
  }

  return dataRows
    .filter((row) => row.some((value) => String(value ?? '').trim().length > 0))
    .map((row) => ({
      shop: String(row[shopIndex] ?? ''),
      maplink: String(row[maplinkIndex] ?? ''),
      city: normalizeText(row[indexOf('city')]),
      district: normalizeText(row[indexOf('district')]),
      lat: parseOptionalNumber(row[indexOf('lat')]),
      lng: parseOptionalNumber(row[indexOf('lng')]),
      placeid: normalizeText(row[indexOf('placeid')]),
      is_lunch: parseBoolean(row[indexOf('is_lunch')]),
      is_dinner: parseBoolean(row[indexOf('is_dinner')]),
      is_drink: parseBoolean(row[indexOf('is_drink')]),
      is_sweet: parseBoolean(row[indexOf('is_sweet')]),
      is_enabled: parseBoolean(row[indexOf('is_enabled')]),
    }));
}

function validateMasterRows(masterRows) {
  const blockingErrors = [];
  const warnings = [];

  for (const row of masterRows.filter((item) => item.is_enabled)) {
    const safeShop = row.shop || '(empty shop)';

    if (!row.shop.trim()) {
      blockingErrors.push({ shop: safeShop, field: 'shop', message: 'shop is required' });
    }

    if (!row.maplink.trim()) {
      blockingErrors.push({
        shop: safeShop,
        field: 'maplink',
        message: 'maplink is required',
      });
    }

    for (const field of ['city', 'district', 'lat', 'lng', 'placeid']) {
      const value = row[field];

      if (value == null || value === '') {
        warnings.push({ shop: safeShop, field, message: `${field} is missing` });
      }
    }
  }

  return { blockingErrors, warnings };
}

function toPublishRow(row) {
  return [
    row.shop,
    row.maplink,
    row.city ?? '',
    row.district ?? '',
    row.lat ?? '',
    row.lng ?? '',
    row.placeid ?? '',
  ];
}

function sortPublishRows(rows) {
  const sorted = rows.sort(
    (left, right) =>
      String(left[2]).localeCompare(String(right[2]), 'zh-Hant') ||
      String(left[3]).localeCompare(String(right[3]), 'zh-Hant') ||
      String(left[0]).localeCompare(String(right[0]), 'zh-Hant'),
  );
  const hasStableLeadingRow = (row) =>
    row[2] !== '' &&
    row[3] !== '' &&
    row[4] !== '' &&
    row[5] !== '' &&
    row[6] !== '';
  if (sorted.length <= 1 || hasStableLeadingRow(sorted[0])) {
    return sorted;
  }
  const firstStableIndex = sorted.findIndex((row) => hasStableLeadingRow(row));
  if (firstStableIndex <= 0) {
    return sorted;
  }
  return [
    sorted[firstStableIndex],
    ...sorted.slice(0, firstStableIndex),
    ...sorted.slice(firstStableIndex + 1),
  ];
}

function projectMasterRows(masterRows) {
  const buckets = {
    lunch: [],
    dinner: [],
    drinks: [],
    sweets: [],
  };

  for (const row of masterRows.filter((item) => item.is_enabled)) {
    const publishRow = toPublishRow(row);

    if (row.is_lunch) {
      buckets.lunch.push(publishRow);
    }

    if (row.is_dinner) {
      buckets.dinner.push(publishRow);
    }

    if (row.is_drink) {
      buckets.drinks.push(publishRow);
    }

    if (row.is_sweet) {
      buckets.sweets.push(publishRow);
    }
  }

  return {
    lunch: sortPublishRows(buckets.lunch),
    dinner: sortPublishRows(buckets.dinner),
    drinks: sortPublishRows(buckets.drinks),
    sweets: sortPublishRows(buckets.sweets),
  };
}

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const cell = String(value ?? '');
          if (/[",\n\r]/.test(cell)) {
            return `"${cell.replaceAll('"', '""')}"`;
          }

          return cell;
        })
        .join(','),
    )
    .join('\n');
}

const masterUrl = `https://docs.google.com/spreadsheets/d/${MASTER_SPREADSHEET_ID}/export?format=csv&gid=${MASTER_SHEET_GID}`;
const response = await fetch(masterUrl);

if (!response.ok) {
  throw new Error(`Failed to fetch live master sheet: ${response.status}`);
}

const csvText = await response.text();
const parsedRows = parseCsv(csvText);
const masterRows = parseMasterRows(parsedRows);
const validation = validateMasterRows(masterRows);
const projected = projectMasterRows(masterRows);

await mkdir(OUTPUT_DIR, { recursive: true });

const summary = {
  masterSpreadsheetId: MASTER_SPREADSHEET_ID,
  masterRowCount: masterRows.length,
  publishCounts: {
    lunch: projected.lunch.length,
    dinner: projected.dinner.length,
    drinks: projected.drinks.length,
    sweets: projected.sweets.length,
  },
  blockingErrors: validation.blockingErrors,
  warnings: validation.warnings,
};

await writeFile(
  new URL('./summary.json', OUTPUT_DIR),
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8',
);

for (const [category, tabName] of Object.entries(CATEGORY_TAB_MAP)) {
  const rows = [PUBLISH_HEADERS, ...projected[category]];
  await writeFile(
    new URL(`./${category}.csv`, OUTPUT_DIR),
    `${toCsv(rows)}\n`,
    'utf8',
  );
  await writeFile(
    new URL(`./${category}.json`, OUTPUT_DIR),
    `${JSON.stringify({ tabName, rows: projected[category] }, null, 2)}\n`,
    'utf8',
  );
}

console.log(
  `Previewed publish payload from live master: ${masterRows.length} master rows -> ` +
    `lunch ${projected.lunch.length}, dinner ${projected.dinner.length}, ` +
    `drinks ${projected.drinks.length}, sweets ${projected.sweets.length}; ` +
    `blocking ${validation.blockingErrors.length}, warnings ${validation.warnings.length}`,
);

if (validation.blockingErrors.length > 0) {
  process.exitCode = 1;
}
