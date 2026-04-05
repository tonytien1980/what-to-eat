import restaurants from '../../data/restaurants.json';
import { getCandidatePool } from '../features/restaurants/selectors';

test('filters active category and enabled restaurants', () => {
  const pool = getCandidatePool(restaurants, 'lunch');

  expect(pool.length).toBeGreaterThan(0);
  expect(pool.every((item) => item.category === 'lunch')).toBe(true);
  expect(pool.every((item) => item.isEnabled)).toBe(true);
});
