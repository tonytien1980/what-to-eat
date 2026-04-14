import type { Category } from './types';

export const MASTER_SHEET_HEADERS = [
  'shop',
  'maplink',
  'city',
  'district',
  'lat',
  'lng',
  'placeid',
  'is_lunch',
  'is_dinner',
  'is_drink',
  'is_sweet',
  'is_enabled',
] as const;

export const PUBLISH_SHEET_HEADERS = [
  'shop',
  'maplink',
  'city',
  'district',
  'lat',
  'lng',
  'placeid',
] as const;

export type PublishSheetCell = string | number;

export interface PublishedRestaurantRow {
  shop: string;
  maplink: string;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  placeid: string | null;
}

export interface MasterRestaurantRow extends PublishedRestaurantRow {
  is_lunch: boolean;
  is_dinner: boolean;
  is_drink: boolean;
  is_sweet: boolean;
  is_enabled: boolean;
}

export interface MasterPublishValidationIssue {
  shop: string;
  field: keyof PublishedRestaurantRow | 'row';
  message: string;
}

export interface MasterPublishValidationReport {
  blockingErrors: MasterPublishValidationIssue[];
  warnings: MasterPublishValidationIssue[];
}

type CategoryBuckets = Record<Category, PublishedRestaurantRow[]>;

const CATEGORY_FLAG_MAP: Record<Category, keyof Pick<
  MasterRestaurantRow,
  'is_lunch' | 'is_dinner' | 'is_drink' | 'is_sweet'
>> = {
  lunch: 'is_lunch',
  dinner: 'is_dinner',
  drinks: 'is_drink',
  sweets: 'is_sweet',
};

function normalizeNullableText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toCompositeKey(row: PublishedRestaurantRow) {
  return [
    row.shop.trim(),
    normalizeNullableText(row.city) ?? '',
    normalizeNullableText(row.district) ?? '',
    row.maplink.trim(),
  ].join('::');
}

function toSortValue(value: string | null) {
  return value ?? '';
}

function hasStableLeadingRow(row: PublishedRestaurantRow) {
  return (
    row.city != null &&
    row.city !== '' &&
    row.district != null &&
    row.district !== '' &&
    row.lat != null &&
    row.lng != null &&
    row.placeid != null &&
    row.placeid !== ''
  );
}

function stabilizeLeadingPublishRows(rows: PublishedRestaurantRow[]) {
  if (rows.length <= 1 || hasStableLeadingRow(rows[0])) {
    return rows;
  }

  const firstStableIndex = rows.findIndex((row) => hasStableLeadingRow(row));

  if (firstStableIndex <= 0) {
    return rows;
  }

  return [
    rows[firstStableIndex],
    ...rows.slice(0, firstStableIndex),
    ...rows.slice(firstStableIndex + 1),
  ];
}

export function buildMasterRowsFromPublishedCategories(
  categories: CategoryBuckets,
) {
  const merged = new Map<string, MasterRestaurantRow>();

  (Object.entries(categories) as Array<[Category, PublishedRestaurantRow[]]>).forEach(
    ([category, rows]) => {
      const flagKey = CATEGORY_FLAG_MAP[category];

      rows.forEach((row) => {
        const dedupeKey = normalizeNullableText(row.placeid) ?? toCompositeKey(row);

        if (!merged.has(dedupeKey)) {
          merged.set(dedupeKey, {
            shop: row.shop,
            maplink: row.maplink,
            city: normalizeNullableText(row.city),
            district: normalizeNullableText(row.district),
            lat: row.lat ?? null,
            lng: row.lng ?? null,
            placeid: normalizeNullableText(row.placeid),
            is_lunch: false,
            is_dinner: false,
            is_drink: false,
            is_sweet: false,
            is_enabled: true,
          });
        }

        const current = merged.get(dedupeKey)!;
        current[flagKey] = true;

        if (!current.city && row.city) {
          current.city = normalizeNullableText(row.city);
        }

        if (!current.district && row.district) {
          current.district = normalizeNullableText(row.district);
        }

        if (current.lat == null && row.lat != null) {
          current.lat = row.lat;
        }

        if (current.lng == null && row.lng != null) {
          current.lng = row.lng;
        }

        if (!current.placeid && row.placeid) {
          current.placeid = normalizeNullableText(row.placeid);
        }
      });
    },
  );

  return Array.from(merged.values()).sort((left, right) =>
    toSortValue(left.shop).localeCompare(toSortValue(right.shop), 'zh-Hant'),
  );
}

export function projectMasterRowsToPublishedCategories(
  masterRows: MasterRestaurantRow[],
): CategoryBuckets {
  const emptyBuckets: CategoryBuckets = {
    lunch: [],
    dinner: [],
    drinks: [],
    sweets: [],
  };

  const sortRows = (rows: PublishedRestaurantRow[]) =>
    stabilizeLeadingPublishRows(
      rows.sort(
        (left, right) =>
          toSortValue(left.city).localeCompare(toSortValue(right.city), 'zh-Hant') ||
          toSortValue(left.district).localeCompare(toSortValue(right.district), 'zh-Hant') ||
          left.shop.localeCompare(right.shop, 'zh-Hant'),
      ),
    );

  const projectRow = (row: MasterRestaurantRow): PublishedRestaurantRow => ({
    shop: row.shop,
    maplink: row.maplink,
    city: row.city,
    district: row.district,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    placeid: row.placeid,
  });

  masterRows
    .filter((row) => row.is_enabled)
    .forEach((row) => {
      const projected = projectRow(row);

      if (row.is_lunch) {
        emptyBuckets.lunch.push(projected);
      }

      if (row.is_dinner) {
        emptyBuckets.dinner.push(projected);
      }

      if (row.is_drink) {
        emptyBuckets.drinks.push(projected);
      }

      if (row.is_sweet) {
        emptyBuckets.sweets.push(projected);
      }
    });

  return {
    lunch: sortRows(emptyBuckets.lunch),
    dinner: sortRows(emptyBuckets.dinner),
    drinks: sortRows(emptyBuckets.drinks),
    sweets: sortRows(emptyBuckets.sweets),
  };
}

export function validateMasterRowsForPublish(
  masterRows: MasterRestaurantRow[],
): MasterPublishValidationReport {
  const blockingErrors: MasterPublishValidationIssue[] = [];
  const warnings: MasterPublishValidationIssue[] = [];

  masterRows
    .filter((row) => row.is_enabled)
    .forEach((row) => {
      const safeShop = row.shop || '(empty shop)';

      if (!row.shop.trim()) {
        blockingErrors.push({
          shop: safeShop,
          field: 'shop',
          message: 'shop is required',
        });
      }

      if (!row.maplink.trim()) {
        blockingErrors.push({
          shop: safeShop,
          field: 'maplink',
          message: 'maplink is required',
        });
      }

      (['city', 'district', 'lat', 'lng', 'placeid'] as const).forEach((field) => {
        const value = row[field];

        if (value == null || value === '') {
          warnings.push({
            shop: safeShop,
            field,
            message: `${field} is missing`,
          });
        }
      });
    });

  return {
    blockingErrors,
    warnings,
  };
}

export function serializePublishedRowsForSheet(
  rows: PublishedRestaurantRow[],
): PublishSheetCell[][] {
  return rows.map((row) => [
    row.shop,
    row.maplink,
    row.city ?? '',
    row.district ?? '',
    row.lat ?? '',
    row.lng ?? '',
    row.placeid ?? '',
  ]);
}
