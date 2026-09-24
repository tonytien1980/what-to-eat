import type { Category } from './types';

// Bootstrap merging only. Publish validation/projection is owned by Code.gs.
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

const CATEGORY_FLAG_MAP = {
  lunch: 'is_lunch', dinner: 'is_dinner', drinks: 'is_drink', sweets: 'is_sweet',
} as const;

function normalizeNullableText(value: string | null | undefined) {
  return value?.trim() || null;
}

function toCompositeKey(row: PublishedRestaurantRow) {
  return [row.shop.trim(), normalizeNullableText(row.city) ?? '', normalizeNullableText(row.district) ?? '', row.maplink.trim()].join('::');
}

export function buildMasterRowsFromPublishedCategories(categories: Record<Category, PublishedRestaurantRow[]>) {
  const merged = new Map<string, MasterRestaurantRow>();
  (Object.entries(categories) as Array<[Category, PublishedRestaurantRow[]]>).forEach(([category, rows]) => {
    rows.forEach(row => {
      const key = normalizeNullableText(row.placeid) ?? toCompositeKey(row);
      if (!merged.has(key)) {
        merged.set(key, {
          shop: row.shop, maplink: row.maplink,
          city: normalizeNullableText(row.city), district: normalizeNullableText(row.district),
          lat: row.lat ?? null, lng: row.lng ?? null, placeid: normalizeNullableText(row.placeid),
          is_lunch: false, is_dinner: false, is_drink: false, is_sweet: false, is_enabled: true,
        });
      }
      const current = merged.get(key)!;
      current[CATEGORY_FLAG_MAP[category]] = true;
      if (!current.city && row.city) current.city = normalizeNullableText(row.city);
      if (!current.district && row.district) current.district = normalizeNullableText(row.district);
      if (current.lat == null && row.lat != null) current.lat = row.lat;
      if (current.lng == null && row.lng != null) current.lng = row.lng;
      if (!current.placeid && row.placeid) current.placeid = normalizeNullableText(row.placeid);
    });
  });
  return Array.from(merged.values()).sort((a, b) => a.shop.localeCompare(b.shop, 'zh-Hant'));
}
