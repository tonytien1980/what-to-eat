import { destinyCards } from '../features/destiny/cards';
import { restaurants } from '../features/restaurants/data';
import { getDestinationPool } from '../features/restaurants/selectors';

test('falls back to category pool when card filter removes every candidate', () => {
  const card = destinyCards.find((item) => item.id === 'golden-famine');
  const pool = getDestinationPool(restaurants, 'dinner', card!);

  expect(pool.length).toBeGreaterThan(0);
  expect(pool.every((item) => item.category === 'dinner')).toBe(true);
});
