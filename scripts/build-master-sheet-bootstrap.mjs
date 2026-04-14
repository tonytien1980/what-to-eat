import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourceRecords = JSON.parse(
  await readFile(new URL('../data/restaurants.json', import.meta.url), 'utf8'),
);

const categoryFlagMap = {
  lunch: 'is_lunch',
  dinner: 'is_dinner',
  drinks: 'is_drink',
  sweets: 'is_sweet',
};

function buildMasterRowsFromRecords(records) {
  const merged = new Map();

  for (const record of records) {
    const dedupeKey =
      record.placeId ??
      [record.name, record.city ?? '', record.district ?? '', record.mapUrl].join('::');

    if (!merged.has(dedupeKey)) {
      merged.set(dedupeKey, {
        shop: record.name,
        maplink: record.mapUrl,
        city: record.city ?? null,
        district: record.district ?? null,
        lat: record.lat ?? null,
        lng: record.lng ?? null,
        placeid: record.placeId ?? null,
        is_lunch: false,
        is_dinner: false,
        is_drink: false,
        is_sweet: false,
        is_enabled: record.isEnabled !== false,
      });
    }

    const current = merged.get(dedupeKey);
    current[categoryFlagMap[record.category]] = true;

    if (!current.city && record.city) {
      current.city = record.city;
    }

    if (!current.district && record.district) {
      current.district = record.district;
    }

    if (current.lat == null && record.lat != null) {
      current.lat = record.lat;
    }

    if (current.lng == null && record.lng != null) {
      current.lng = record.lng;
    }

    if (!current.placeid && record.placeId) {
      current.placeid = record.placeId;
    }
  }

  return Array.from(merged.values()).sort(
    (left, right) =>
      (left.city ?? '').localeCompare(right.city ?? '', 'zh-Hant') ||
      (left.district ?? '').localeCompare(right.district ?? '', 'zh-Hant') ||
      left.shop.localeCompare(right.shop, 'zh-Hant'),
  );
}

const masterRows = buildMasterRowsFromRecords(sourceRecords);

await mkdir(new URL('../output/master-sheet-bootstrap/', import.meta.url), {
  recursive: true,
});

await writeFile(
  new URL('../output/master-sheet-bootstrap/master-rows.json', import.meta.url),
  `${JSON.stringify(masterRows, null, 2)}\n`,
  'utf8',
);

console.log(`Built ${masterRows.length} master rows from ${sourceRecords.length} published records`);
