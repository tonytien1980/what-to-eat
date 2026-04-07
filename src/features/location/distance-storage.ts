import { DISTANCE_STORAGE_KEY } from './constants';
import type { Coordinates } from './distance';

export type DistancePermissionState = 'unknown' | 'accepted' | 'denied';

export interface SavedDistancePreference {
  permission: DistancePermissionState;
  coordinates: Coordinates | null;
  savedAt: string | null;
}

export function createDefaultDistancePreference(): SavedDistancePreference {
  return {
    permission: 'unknown',
    coordinates: null,
    savedAt: null,
  };
}

function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Coordinates>;

  return (
    typeof candidate.lat === 'number' &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lng === 'number' &&
    Number.isFinite(candidate.lng)
  );
}

function isSavedDistancePreference(value: unknown): value is SavedDistancePreference {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<SavedDistancePreference>;

  return (
    (candidate.permission === 'unknown' ||
      candidate.permission === 'accepted' ||
      candidate.permission === 'denied') &&
    (candidate.coordinates === null || isCoordinates(candidate.coordinates)) &&
    (typeof candidate.savedAt === 'string' || candidate.savedAt === null)
  );
}

export function readSavedDistancePreference(
  storage: Pick<Storage, 'getItem'> | null =
    typeof window !== 'undefined' ? window.localStorage : null,
) {
  if (!storage) {
    return createDefaultDistancePreference();
  }

  const raw = storage.getItem(DISTANCE_STORAGE_KEY);

  if (!raw) {
    return createDefaultDistancePreference();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isSavedDistancePreference(parsed)
      ? parsed
      : createDefaultDistancePreference();
  } catch {
    return createDefaultDistancePreference();
  }
}

export function saveDistancePreference(
  preference: SavedDistancePreference,
  storage: Pick<Storage, 'setItem'> | null =
    typeof window !== 'undefined' ? window.localStorage : null,
) {
  if (!storage) {
    return;
  }

  storage.setItem(DISTANCE_STORAGE_KEY, JSON.stringify(preference));
}
