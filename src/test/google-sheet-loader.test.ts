import { restaurants as fallbackRestaurants } from '../features/restaurants/data';
import {
  parsePublishedSheetCsv,
  resolveRestaurantCatalog,
} from '../features/restaurants/google-sheet-loader';

const sources = [
  {
    category: 'lunch' as const,
    url: 'https://example.com/lunch.csv',
  },
  {
    category: 'drinks' as const,
    url: 'https://example.com/drinks.csv',
  },
];

test('loads restaurants from published Google Sheet sources at runtime', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      new Response('shop,maplink,city,district,lat,lng\n"招牌, 牛肉麵",https://maps.app.goo.gl/1,臺北市,中山區,25.047,121.531\n', {
        status: 200,
      }),
    )
    .mockResolvedValueOnce(
      new Response('shop,maplink\n迷客夏,https://maps.app.goo.gl/2\n', {
        status: 200,
      }),
    );

  const result = await resolveRestaurantCatalog({
    fallbackRestaurants,
    fetcher,
    sources,
  });

  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(result.status).toBe('live');
  expect(result.sourceLabel).toBe('Google Sheet 即時資料');
  expect(result.restaurants).toHaveLength(2);
  expect(result.restaurants[0]).toMatchObject({
    name: '招牌, 牛肉麵',
    category: 'lunch',
    mapUrl: 'https://maps.app.goo.gl/1',
    city: '臺北市',
    district: '中山區',
    lat: 25.047,
    lng: 121.531,
    isEnabled: true,
  });
  expect(result.restaurants[1]).toMatchObject({
    name: '迷客夏',
    category: 'drinks',
  });
});

test('falls back to bundled snapshot when Google Sheet loading fails', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('network down'));

  const result = await resolveRestaurantCatalog({
    fallbackRestaurants,
    fetcher,
    sources,
  });

  expect(result.status).toBe('fallback');
  expect(result.sourceLabel).toBe('本地快照備援');
  expect(result.restaurants).toBe(fallbackRestaurants);
});

test('parses quoted rows from published Google Sheet csv', () => {
  expect(
    parsePublishedSheetCsv(
      'shop,maplink\n"招牌, 牛肉麵",https://maps.app.goo.gl/demo\n',
    ),
  ).toEqual([
    {
      name: '招牌, 牛肉麵',
      mapUrl: 'https://maps.app.goo.gl/demo',
      city: null,
      district: null,
      lat: null,
      lng: null,
    },
  ]);
});

test('parses optional city, district, lat, and lng columns from published Google Sheet csv', () => {
  expect(
    parsePublishedSheetCsv(
      'shop,maplink,city,district,lat,lng\n招牌牛肉麵,https://maps.app.goo.gl/demo,臺北市,中山區,25.047,121.531\n',
    ),
  ).toEqual([
    {
      name: '招牌牛肉麵',
      mapUrl: 'https://maps.app.goo.gl/demo',
      city: '臺北市',
      district: '中山區',
      lat: 25.047,
      lng: 121.531,
    },
  ]);
});

test('defaults location columns when published Google Sheet rows still use the old two-column format', async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response('shop,maplink\n招牌牛肉麵,https://maps.app.goo.gl/demo\n', {
      status: 200,
    }),
  );

  const result = await resolveRestaurantCatalog({
    fallbackRestaurants,
    fetcher,
    sources: [sources[0]],
  });

  expect(result.restaurants[0]).toMatchObject({
    city: '臺北市',
    district: '中山區',
    lat: null,
    lng: null,
  });
});

test('returns no rows when the required english headers are missing', () => {
  expect(
    parsePublishedSheetCsv(
      '店名,地圖連結,城市,地區\n招牌牛肉麵,https://maps.app.goo.gl/demo,臺北市,中山區\n',
    ),
  ).toEqual([]);
});
