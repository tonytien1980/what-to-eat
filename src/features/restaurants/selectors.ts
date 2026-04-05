import type { DestinyCard } from '../destiny/types';
import type { Category, RestaurantRecord } from './types';

export function getCandidatePool(
  restaurants: RestaurantRecord[],
  category: Category,
) {
  return restaurants.filter(
    (restaurant) => restaurant.category === category && restaurant.isEnabled,
  );
}

function matchesCardFilter(restaurant: RestaurantRecord, card: DestinyCard) {
  const filter = card.filter;

  if (!filter) {
    return true;
  }

  if (filter.priceLevel && !filter.priceLevel.includes(restaurant.priceLevel)) {
    return false;
  }

  if (
    filter.distanceLevel &&
    !filter.distanceLevel.includes(restaurant.distanceLevel)
  ) {
    return false;
  }

  if (
    filter.requiredTags &&
    !filter.requiredTags.every((tag) => restaurant.tags.includes(tag))
  ) {
    return false;
  }

  return true;
}

export function getDestinationPool(
  restaurants: RestaurantRecord[],
  category: Category,
  card: DestinyCard,
) {
  const basePool = getCandidatePool(restaurants, category);
  const filteredPool = basePool.filter((restaurant) =>
    matchesCardFilter(restaurant, card),
  );

  return filteredPool.length > 0 ? filteredPool : basePool;
}

export function pickRandomRestaurant(
  restaurants: RestaurantRecord[],
  randomValue = Math.random(),
) {
  return restaurants[Math.floor(randomValue * restaurants.length)];
}
