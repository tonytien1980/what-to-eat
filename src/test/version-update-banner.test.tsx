import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from '../App';
import { BUILD_ID } from '../features/version/build-meta';

beforeEach(() => {
  window.localStorage.clear();
  (globalThis as { __ENABLE_VERSION_CHECK_IN_TEST__?: boolean }).__ENABLE_VERSION_CHECK_IN_TEST__ = true;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        buildId: BUILD_ID,
        builtAt: '2026-04-12T00:00:00.000Z',
      }),
    })) as unknown as typeof fetch,
  );
});

afterEach(() => {
  delete (globalThis as { __ENABLE_VERSION_CHECK_IN_TEST__?: boolean })
    .__ENABLE_VERSION_CHECK_IN_TEST__;
  vi.unstubAllGlobals();
});

test('does not show an update prompt when the deployed version matches the current build', async () => {
  render(<App />);

  expect(
    await screen.findByRole('button', { name: '更改預計冒險地' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: '偵測到新版本，點此更新' }),
  ).not.toBeInTheDocument();
});

test('shows a lightweight update prompt when a newer deployed build is detected', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        buildId: `${BUILD_ID}-new`,
        builtAt: '2026-04-12T00:05:00.000Z',
      }),
    })) as unknown as typeof fetch,
  );

  render(<App />);

  expect(
    await screen.findByRole('button', { name: '偵測到新版本，點此更新' }),
  ).toBeInTheDocument();
});
