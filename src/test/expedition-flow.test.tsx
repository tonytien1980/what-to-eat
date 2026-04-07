import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { afterEach } from 'vitest';
import { vi } from 'vitest';
import App from '../App';
import { DISTANCE_STORAGE_KEY } from '../features/location/constants';

const originalGeolocation = window.navigator.geolocation;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: originalGeolocation,
  });
});

test('starts an expedition and reveals a destination', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  expect(screen.getByLabelText(/遠征卡背/)).toBeInTheDocument();
  expect(screen.queryByText(/本日遠征目的地/)).not.toBeInTheDocument();
  expect(screen.queryByText(/命運卡：/)).not.toBeInTheDocument();

  expect(
    await screen.findByText('今日遠征地', {}, { timeout: 4000 }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole('link', { name: '出發去吃' }, { timeout: 5000 }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '再抽一次' })).toBeInTheDocument();
});

test('reveals a distance strip after a user grants geolocation', async () => {
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success({
          coords: {
            latitude: 25.047,
            longitude: 121.531,
            accuracy: 20,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as GeolocationPosition);
      }),
    },
  });

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  await screen.findByRole('link', { name: '出發去吃' }, { timeout: 5000 });
  fireEvent.click(screen.getByRole('button', { name: '啟用定位後可顯示遠征地距離' }));

  expect(await screen.findByText(/遠征地距離你約/)).toBeInTheDocument();
  expect(window.localStorage.getItem(DISTANCE_STORAGE_KEY)).toContain('"permission":"accepted"');
});

test('does not request geolocation before the player opts in', async () => {
  const getCurrentPosition = vi.fn();

  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition,
    },
  });

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  await screen.findByRole('link', { name: '出發去吃' }, { timeout: 5000 });

  expect(getCurrentPosition).not.toHaveBeenCalled();
  expect(
    screen.getByRole('button', { name: '啟用定位後可顯示遠征地距離' }),
  ).toBeInTheDocument();
});

test('uses saved distance coordinates after a refresh-like reload', async () => {
  window.localStorage.setItem(
    DISTANCE_STORAGE_KEY,
    JSON.stringify({
      permission: 'accepted',
      coordinates: {
        lat: 25.047,
        lng: 121.531,
      },
      savedAt: '2026-04-08T00:00:00.000Z',
    }),
  );

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  await screen.findByRole('link', { name: '出發去吃' }, { timeout: 5000 });

  expect(
    screen.queryByRole('button', { name: '啟用定位後可顯示遠征地距離' }),
  ).not.toBeInTheDocument();
  expect(screen.getByText(/遠征地距離你約/)).toBeInTheDocument();
});

test('shows browser-permission guidance instead of restart wording when geolocation is denied', async () => {
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((_: PositionCallback, error?: PositionErrorCallback) => {
        error?.({
          code: 1,
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      }),
    },
  });

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  await screen.findByRole('link', { name: '出發去吃' }, { timeout: 5000 });
  fireEvent.click(screen.getByRole('button', { name: '啟用定位後可顯示遠征地距離' }));

  expect(
    await screen.findByRole('button', {
      name: '請先在瀏覽器允許定位，才能顯示遠征地距離',
    }),
  ).toBeInTheDocument();
  expect(screen.queryByText('重新啟用定位以顯示遠征地距離')).not.toBeInTheDocument();
});
