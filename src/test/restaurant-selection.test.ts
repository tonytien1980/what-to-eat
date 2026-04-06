import { restaurants } from '../features/restaurants/data';
import {
  getCandidatePool,
  getLocationAwareCandidatePool,
} from '../features/restaurants/selectors';

test('includes the imported full reference snapshot', () => {
  expect(restaurants.length).toBeGreaterThanOrEqual(39);
});

test('filters active category and enabled restaurants', () => {
  const pool = getCandidatePool(restaurants, 'lunch');

  expect(pool.length).toBeGreaterThan(0);
  expect(pool.every((item) => item.category === 'lunch')).toBe(true);
  expect(pool.every((item) => item.isEnabled)).toBe(true);
});

test('uses district first, then city, then full category fallback for location-aware pools', () => {
  const sampleRestaurants = [
    {
      id: 'lunch-a',
      name: '台北中山麵館',
      category: 'lunch' as const,
      mapUrl: 'https://example.com/a',
      tags: ['lunch'],
      priceLevel: 'medium' as const,
      distanceLevel: 'near' as const,
      city: '臺北市',
      district: '中山區',
      isEnabled: true,
    },
    {
      id: 'lunch-b',
      name: '台北大安飯館',
      category: 'lunch' as const,
      mapUrl: 'https://example.com/b',
      tags: ['lunch'],
      priceLevel: 'medium' as const,
      distanceLevel: 'near' as const,
      city: '臺北市',
      district: '大安區',
      isEnabled: true,
    },
    {
      id: 'lunch-c',
      name: '新北板橋小吃',
      category: 'lunch' as const,
      mapUrl: 'https://example.com/c',
      tags: ['lunch'],
      priceLevel: 'medium' as const,
      distanceLevel: 'near' as const,
      city: '新北市',
      district: '板橋區',
      isEnabled: true,
    },
  ];

  expect(
    getLocationAwareCandidatePool(sampleRestaurants, 'lunch', {
      city: '臺北市',
      district: '中山區',
    }).map((item) => item.id),
  ).toEqual(['lunch-a']);

  expect(
    getLocationAwareCandidatePool(sampleRestaurants, 'lunch', {
      city: '臺北市',
      district: '信義區',
    }).map((item) => item.id),
  ).toEqual(['lunch-a', 'lunch-b']);

  expect(
    getLocationAwareCandidatePool(sampleRestaurants, 'lunch', {
      city: '桃園市',
      district: '中壢區',
    }).map((item) => item.id),
  ).toEqual(['lunch-a', 'lunch-b', 'lunch-c']);
});
