import { describe, expect, test } from 'vitest';
import {
  calculateDistanceMeters,
  formatDistanceLabel,
} from '../features/location/distance';

describe('distance helpers', () => {
  test('formats short and long straight-line distance labels', () => {
    expect(formatDistanceLabel(450)).toBe('遠征地距離你約 450 公尺');
    expect(formatDistanceLabel(1200)).toBe('遠征地距離你約 1.2 公里');
  });

  test('calculates a positive straight-line distance from two coordinates', () => {
    const meters = calculateDistanceMeters(
      { lat: 25.047, lng: 121.531 },
      { lat: 25.052, lng: 121.544 },
    );

    expect(meters).toBeGreaterThan(0);
  });
});
