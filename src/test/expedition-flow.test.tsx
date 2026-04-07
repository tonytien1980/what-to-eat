import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { vi } from 'vitest';
import App from '../App';

const originalGeolocation = window.navigator.geolocation;

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
