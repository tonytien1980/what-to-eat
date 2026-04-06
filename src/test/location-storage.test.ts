import {
  LOCATION_STORAGE_KEY,
  createDefaultLocationPreference,
  readSavedLocationPreference,
  saveLocationPreference,
} from '../features/location/storage';

beforeEach(() => {
  window.localStorage.clear();
});

test('returns the Zhongshan anchor as the Phase 1 default location', () => {
  expect(createDefaultLocationPreference()).toMatchObject({
    city: '臺北市',
    district: '中山區',
    source: 'default',
  });
});

test('saves and restores a manual location preference from localStorage', () => {
  saveLocationPreference({
    city: '臺北市',
    district: '大安區',
    source: 'manual',
    promptState: 'accepted',
    savedAt: '2026-04-06T00:00:00+08:00',
  });

  expect(readSavedLocationPreference()).toMatchObject({
    city: '臺北市',
    district: '大安區',
    source: 'manual',
  });
  expect(window.localStorage.getItem(LOCATION_STORAGE_KEY)).toContain('大安區');
});
