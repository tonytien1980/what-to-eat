import type { DestinyCard } from '../destiny/types';
import type { LocationPreference } from '../location/types';
import { getRestaurantCity, getRestaurantDistrict } from '../location/options';
import type { Category, RestaurantRecord } from './types';

export function getCandidatePool(
  restaurants: RestaurantRecord[],
  category: Category,
) {
  return restaurants.filter(
    (restaurant) => restaurant.category === category && restaurant.isEnabled,
  );
}

export function getLocationAwareCandidatePool(
  restaurants: RestaurantRecord[],
  category: Category,
  location: Pick<LocationPreference, 'city' | 'district'> | null = null,
) {
  const basePool = getCandidatePool(restaurants, category);

  if (!location?.city) {
    return basePool;
  }

  const cityPool = basePool.filter(
    (restaurant) => getRestaurantCity(restaurant) === location.city,
  );

  if (location.district) {
    const districtPool = cityPool.filter(
      (restaurant) => getRestaurantDistrict(restaurant) === location.district,
    );

    if (districtPool.length > 0) {
      return districtPool;
    }
  }

  return cityPool.length > 0 ? cityPool : basePool;
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
  location: Pick<LocationPreference, 'city' | 'district'> | null = null,
) {
  const basePool = getLocationAwareCandidatePool(restaurants, category, location);
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
