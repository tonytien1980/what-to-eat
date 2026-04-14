import { describe, expect, test } from 'vitest';

import {
  buildMasterRowsFromPublishedCategories,
  projectMasterRowsToPublishedCategories,
  serializePublishedRowsForSheet,
  validateMasterRowsForPublish,
  type MasterRestaurantRow,
  type PublishedRestaurantRow,
} from '../features/restaurants/master-publish-sync';

const lunchRow: PublishedRestaurantRow = {
  shop: '吉野家(館前店)',
  maplink: 'https://www.google.com/maps/search/?api=1&query=25.0448,121.5151&query_place_id=place-gf',
  city: '台北市',
  district: '中正區',
  lat: 25.0448,
  lng: 121.5151,
  placeid: 'place-gf',
};

const dinnerRow: PublishedRestaurantRow = {
  ...lunchRow,
};

describe('buildMasterRowsFromPublishedCategories', () => {
  test('merges the same place into one master row and turns category membership into booleans', () => {
    const masterRows = buildMasterRowsFromPublishedCategories({
      lunch: [lunchRow],
      dinner: [dinnerRow],
      drinks: [],
      sweets: [],
    });

    expect(masterRows).toEqual([
      {
        shop: '吉野家(館前店)',
        maplink: 'https://www.google.com/maps/search/?api=1&query=25.0448,121.5151&query_place_id=place-gf',
        city: '台北市',
        district: '中正區',
        lat: 25.0448,
        lng: 121.5151,
        placeid: 'place-gf',
        is_lunch: true,
        is_dinner: true,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
    ]);
  });
});

describe('projectMasterRowsToPublishedCategories', () => {
  test('fans out one enabled master row into multiple publish categories', () => {
    const masterRows: MasterRestaurantRow[] = [
      {
        shop: '吉野家(館前店)',
        maplink: 'https://www.google.com/maps/search/?api=1&query=25.0448,121.5151&query_place_id=place-gf',
        city: '台北市',
        district: '中正區',
        lat: 25.0448,
        lng: 121.5151,
        placeid: 'place-gf',
        is_lunch: true,
        is_dinner: true,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
    ];

    const projected = projectMasterRowsToPublishedCategories(masterRows);

    expect(projected.lunch).toEqual([lunchRow]);
    expect(projected.dinner).toEqual([dinnerRow]);
    expect(projected.drinks).toEqual([]);
    expect(projected.sweets).toEqual([]);
  });

  test('sorts publish rows by city, district, and shop', () => {
    const masterRows: MasterRestaurantRow[] = [
      {
        shop: 'B店',
        maplink: 'https://maps.example/b',
        city: '台北市',
        district: '松山區',
        lat: 25.05,
        lng: 121.56,
        placeid: 'p-b',
        is_lunch: true,
        is_dinner: false,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
      {
        shop: 'A店',
        maplink: 'https://maps.example/a',
        city: '台北市',
        district: '中山區',
        lat: 25.06,
        lng: 121.53,
        placeid: 'p-a',
        is_lunch: true,
        is_dinner: false,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
    ];

    const projected = projectMasterRowsToPublishedCategories(masterRows);

    expect(projected.lunch.map((row) => row.shop)).toEqual(['A店', 'B店']);
  });

  test('moves a complete row to the front when the leading row is missing trailing location fields', () => {
    const masterRows: MasterRestaurantRow[] = [
      {
        shop: 'A店',
        maplink: 'https://maps.example/a',
        city: '台北市',
        district: '中山區',
        lat: null,
        lng: null,
        placeid: null,
        is_lunch: false,
        is_dinner: true,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
      {
        shop: 'B店',
        maplink: 'https://maps.example/b',
        city: '台北市',
        district: '中山區',
        lat: 25.05,
        lng: 121.52,
        placeid: 'p-b',
        is_lunch: false,
        is_dinner: true,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
    ];

    const projected = projectMasterRowsToPublishedCategories(masterRows);

    expect(projected.dinner.map((row) => row.shop)).toEqual(['B店', 'A店']);
  });

  test('serializes publish rows into the stable 7-column sheet contract', () => {
    const serialized = serializePublishedRowsForSheet([
      {
        shop: '野菜家',
        maplink: 'https://maps.app.goo.gl/demo',
        city: '台北市',
        district: '中山區',
        lat: null,
        lng: 121.5,
        placeid: null,
      },
    ]);

    expect(serialized).toEqual([
      ['野菜家', 'https://maps.app.goo.gl/demo', '台北市', '中山區', '', 121.5, ''],
    ]);
  });
});

describe('validateMasterRowsForPublish', () => {
  test('treats missing lat lng placeid as warnings in v1 instead of hard errors', () => {
    const report = validateMasterRowsForPublish([
      {
        shop: '野菜家',
        maplink: 'https://maps.app.goo.gl/demo',
        city: '台北市',
        district: '中山區',
        lat: null,
        lng: null,
        placeid: null,
        is_lunch: false,
        is_dinner: true,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
    ]);

    expect(report.blockingErrors).toEqual([]);
    expect(report.warnings).toEqual([
      expect.objectContaining({
        shop: '野菜家',
        field: 'lat',
      }),
      expect.objectContaining({
        shop: '野菜家',
        field: 'lng',
      }),
      expect.objectContaining({
        shop: '野菜家',
        field: 'placeid',
      }),
    ]);
  });

  test('hard-fails rows missing shop or maplink', () => {
    const report = validateMasterRowsForPublish([
      {
        shop: '',
        maplink: '',
        city: '台北市',
        district: '中山區',
        lat: 25.1,
        lng: 121.5,
        placeid: 'place-x',
        is_lunch: true,
        is_dinner: false,
        is_drink: false,
        is_sweet: false,
        is_enabled: true,
      },
    ]);

    expect(report.blockingErrors).toEqual([
      expect.objectContaining({ field: 'shop' }),
      expect.objectContaining({ field: 'maplink' }),
    ]);
  });
});
