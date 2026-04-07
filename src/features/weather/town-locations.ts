import rawTownLocations from '../../../data/cwa-town-locations.json';
import type { LocationPreference } from '../location/types';

export interface CwaTownLocation {
  city: string;
  countyCode: string;
  district: string;
  label: string;
  townId: string;
}

export const cwaTownLocations = rawTownLocations as CwaTownLocation[];

export function normalizeTownPlaceName(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^台/u, '臺');
}

export function resolveCwaTownLocation(
  location: Pick<LocationPreference, 'city' | 'district'> | null,
) {
  const city = normalizeTownPlaceName(location?.city);
  const district = normalizeTownPlaceName(location?.district);

  if (!city || !district) {
    return null;
  }

  return (
    cwaTownLocations.find(
      (entry) => entry.city === city && entry.district === district,
    ) ?? null
  );
}
