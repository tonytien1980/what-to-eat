import type { RestaurantRecord } from '../restaurants/types';
import {
  DEFAULT_LOCATION_CITY,
  DEFAULT_LOCATION_DISTRICT,
} from './constants';
import { createDefaultLocationPreference } from './storage';
import type { LocationOptionGroup, LocationPreference } from './types';

function normalizePlaceName(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^台/u, '臺');
}

export function getRestaurantCity(restaurant: Pick<RestaurantRecord, 'city'>) {
  return normalizePlaceName(restaurant.city) ?? DEFAULT_LOCATION_CITY;
}

export function getRestaurantDistrict(
  restaurant: Pick<RestaurantRecord, 'district'>,
) {
  return normalizePlaceName(restaurant.district) ?? DEFAULT_LOCATION_DISTRICT;
}

export function buildLocationOptionGroups(
  restaurants: RestaurantRecord[],
  preservedLocations: Array<Pick<LocationPreference, 'city' | 'district'>> = [],
) {
  const cityMap = new Map<string, Set<string>>();

  cityMap.set(DEFAULT_LOCATION_CITY, new Set([DEFAULT_LOCATION_DISTRICT]));

  for (const restaurant of restaurants) {
    const city = getRestaurantCity(restaurant);
    const district = getRestaurantDistrict(restaurant);

    if (!cityMap.has(city)) {
      cityMap.set(city, new Set());
    }

    if (district) {
      cityMap.get(city)!.add(district);
    }
  }

  for (const preservedLocation of preservedLocations) {
    const city = normalizePlaceName(preservedLocation.city);
    const district = normalizePlaceName(preservedLocation.district);

    if (!city) {
      continue;
    }

    if (!cityMap.has(city)) {
      cityMap.set(city, new Set());
    }

    if (district) {
      cityMap.get(city)!.add(district);
    }
  }

  return Array.from(cityMap.entries())
    .map(([city, districts]) => ({
      city,
      districts: Array.from(districts).sort((left, right) =>
        left.localeCompare(right, 'zh-Hant'),
      ),
    }))
    .sort((left, right) => {
      if (left.city === DEFAULT_LOCATION_CITY) {
        return -1;
      }

      if (right.city === DEFAULT_LOCATION_CITY) {
        return 1;
      }

      return left.city.localeCompare(right.city, 'zh-Hant');
    });
}

export function getDistrictOptions(
  groups: LocationOptionGroup[],
  city: string,
) {
  return groups.find((group) => group.city === city)?.districts ?? [];
}

export function ensureValidLocationPreference(
  preference: LocationPreference | null,
  groups: LocationOptionGroup[],
) {
  const fallback = createDefaultLocationPreference();

  if (!preference) {
    return fallback;
  }

  const cityGroup = groups.find((group) => group.city === preference.city);

  if (!cityGroup) {
    return fallback;
  }

  if (preference.district && !cityGroup.districts.includes(preference.district)) {
    return {
      ...preference,
      district: null,
    };
  }

  return preference;
}

export function formatLocationLabel(location: LocationPreference) {
  return location.district ? `${location.city}${location.district}` : location.city;
}
