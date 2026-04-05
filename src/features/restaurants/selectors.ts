import type { Category, RestaurantRecord } from './types';

export function getCandidatePool(
  restaurants: RestaurantRecord[],
  category: Category,
) {
  return restaurants.filter(
    (restaurant) => restaurant.category === category && restaurant.isEnabled,
  );
}

export function pickRandomRestaurant(restaurants: RestaurantRecord[]) {
  return restaurants[Math.floor(Math.random() * restaurants.length)];
}
