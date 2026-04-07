import {
  createDefaultDistancePreference,
  readSavedDistancePreference,
  saveDistancePreference,
} from '../features/location/distance-storage';

beforeEach(() => {
  window.localStorage.clear();
});

test('persists accepted distance coordinates in localStorage', () => {
  saveDistancePreference({
    permission: 'accepted',
    coordinates: {
      lat: 25.047,
      lng: 121.531,
    },
    savedAt: '2026-04-08T00:00:00.000Z',
  });

  expect(readSavedDistancePreference()).toEqual({
    permission: 'accepted',
    coordinates: {
      lat: 25.047,
      lng: 121.531,
    },
    savedAt: '2026-04-08T00:00:00.000Z',
  });
});

test('falls back safely when no distance preference has been saved', () => {
  expect(readSavedDistancePreference()).toEqual(createDefaultDistancePreference());
});
