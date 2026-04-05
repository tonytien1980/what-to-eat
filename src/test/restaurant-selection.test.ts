import { restaurants } from '../features/restaurants/data';
import { getCandidatePool } from '../features/restaurants/selectors';

test('includes the imported full reference snapshot', () => {
  expect(restaurants.length).toBeGreaterThanOrEqual(39);
});

test('filters active category and enabled restaurants', () => {
  const pool = getCandidatePool(restaurants, 'lunch');

  expect(pool.length).toBeGreaterThan(0);
  expect(pool.every((item) => item.category === 'lunch')).toBe(true);
  expect(pool.every((item) => item.isEnabled)).toBe(true);
});
