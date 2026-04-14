import {
  buildLocationOptionGroups,
  ensureValidLocationPreference,
} from '../features/location/options';
import type { RestaurantRecord } from '../features/restaurants/types';

const sampleRestaurants: RestaurantRecord[] = [
  {
    id: 'lunch-zhongshan',
    name: '中山午餐',
    category: 'lunch',
    mapUrl: 'https://example.com/zhongshan',
    placeId: null,
    lat: 25.05,
    lng: 121.52,
    tags: ['meal'],
    priceLevel: 'medium',
    distanceLevel: 'near',
    city: '臺北市',
    district: '中山區',
    isEnabled: true,
  },
];

test('keeps the currently selected district available in location groups even before live sheet data hydrates', () => {
  const groups = buildLocationOptionGroups(sampleRestaurants, [
    {
      city: '臺北市',
      district: '松山區',
    },
  ]);

  expect(groups.find((group) => group.city === '臺北市')?.districts).toContain(
    '松山區',
  );
});

test('does not drop a manually selected district just because the fallback snapshot has not loaded that district yet', () => {
  const groups = buildLocationOptionGroups(sampleRestaurants, [
    {
      city: '臺北市',
      district: '松山區',
    },
  ]);

  expect(
    ensureValidLocationPreference(
      {
        city: '臺北市',
        district: '松山區',
        source: 'manual',
        promptState: 'accepted',
        savedAt: '2026-04-08T00:00:00.000Z',
      },
      groups,
    ),
  ).toMatchObject({
    city: '臺北市',
    district: '松山區',
  });
});
