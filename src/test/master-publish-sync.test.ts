import { expect, test } from 'vitest';
import { buildMasterRowsFromPublishedCategories } from '../features/restaurants/master-publish-sync';

test('bootstrap merges the same place into one master row with category flags', () => {
  const row = { shop: '吉野家(館前店)', maplink: 'https://maps.google.com/?q=test', city: '台北市', district: '中正區', lat: 25.0448, lng: 121.5151, placeid: 'place-gf' };
  expect(buildMasterRowsFromPublishedCategories({ lunch: [row], dinner: [{ ...row }], drinks: [], sweets: [] })).toEqual([
    { ...row, is_lunch: true, is_dinner: true, is_drink: false, is_sweet: false, is_enabled: true },
  ]);
});
