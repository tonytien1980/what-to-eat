import {
  DEFAULT_LOCATION_CITY,
  DEFAULT_LOCATION_DISTRICT,
  LOCATION_STORAGE_KEY,
} from './constants';
import type { LocationPreference } from './types';

export { LOCATION_STORAGE_KEY } from './constants';

function normalizeCity(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^台/u, '臺');
}

function normalizeDistrict(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function createDefaultLocationPreference(): LocationPreference {
  return {
    city: DEFAULT_LOCATION_CITY,
    district: DEFAULT_LOCATION_DISTRICT,
    source: 'default',
    promptState: 'accepted',
    savedAt: null,
  };
}

function isLocationPreference(value: unknown): value is LocationPreference {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LocationPreference>;

  return (
    typeof candidate.city === 'string' &&
    (typeof candidate.district === 'string' || candidate.district === null) &&
    (candidate.source === 'default' || candidate.source === 'manual') &&
    candidate.promptState === 'accepted' &&
    (typeof candidate.savedAt === 'string' || candidate.savedAt === null)
  );
}

export function readSavedLocationPreference(
  storage: Pick<Storage, 'getItem'> | null =
    typeof window !== 'undefined' ? window.localStorage : null,
) {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(LOCATION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isLocationPreference(parsed)) {
      return null;
    }

    const city = normalizeCity(parsed.city);

    if (!city) {
      return null;
    }

    return {
      city,
      district: normalizeDistrict(parsed.district),
      source: parsed.source,
      promptState: parsed.promptState,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveLocationPreference(
  preference: LocationPreference,
  storage: Pick<Storage, 'setItem'> | null =
    typeof window !== 'undefined' ? window.localStorage : null,
) {
  if (!storage) {
    return;
  }

  storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(preference));
}
