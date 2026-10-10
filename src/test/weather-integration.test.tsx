import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from '../App';
import districtManifest from '../../images/backgrounds/district-manifest.json';
import { saveLocationPreference } from '../features/location/storage';
import { resolveCwaTownLocation } from '../features/weather/town-locations';

const towns = [
  ['松山區', '6300100'], ['信義區', '6300200'], ['大安區', '6300300'],
  ['中山區', '6300400'], ['中正區', '6300500'], ['大同區', '6300600'],
  ['萬華區', '6300700'], ['文山區', '6300800'], ['南港區', '6300900'],
  ['內湖區', '6301000'], ['士林區', '6301100'], ['北投區', '6301200'],
] as const;
let now = Date.parse('2026-10-11T00:15:00+08:00');

beforeEach(() => {
  now += 15 * 60 * 1000;
  vi.useFakeTimers();
  vi.setSystemTime(now);
  window.localStorage.clear();
  globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__ = true;
});

afterEach(() => {
  cleanup();
  delete globalThis.__ENABLE_LIVE_WEATHER_IN_TEST__;
  document.querySelectorAll('script[data-cwa-town-script]').forEach(script => script.remove());
  vi.useRealTimers();
});

function chooseLocation(district: string | null) {
  saveLocationPreference({
    city: '臺北市', district, source: 'manual', promptState: 'accepted', savedAt: null,
  });
}

async function deliverForecast() {
  await act(async () => {
    window.Time_3hr = { C: Array.from({ length: 28 }, (_, i) => {
      const date = new Date(Math.floor(Date.now() / 3600000) * 3600000 + (i + 8) * 3600000);
      const pad = (value: number) => String(value).padStart(2, '0');
      return `${pad(date.getUTCHours())} ${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())}`;
    }) };
    window.TempArray_3hr = Object.fromEntries(towns.map(([, id], i) => [id, {
      C: { T: Array(28).fill(20 + i), AT: Array(28).fill(25 + i) },
      Wx: { C: Array.from({ length: 28 }, () => ['07', '陰'] as [string, string]) },
    }]));
    const script = document.querySelector('script[data-cwa-town-script]');
    expect(script).not.toBeNull();
    script!.dispatchEvent(new Event('load'));
  });
}

test('every shipped district background has an official weather mapping', () => {
  for (const district of Object.keys(districtManifest.cities.臺北市.districts)) {
    expect(resolveCwaTownLocation({ city: '臺北市', district }), district).not.toBeNull();
  }
});

test.each(towns)('%s renders its own forecast and matching background through the real loader', async (district, id) => {
  chooseLocation(district);
  const { container } = render(<App />);
  await deliverForecast();
  const index = towns.findIndex(([, townId]) => townId === id);
  expect(screen.getByText(new RegExp('預報 · 陰 ' + (20 + index) + '°'))).toBeInTheDocument();
  expect(screen.getByText(new RegExp('體感 ' + (25 + index) + '° · 未來 24 小時'))).toBeInTheDocument();
  const background = container.querySelector<HTMLElement>('.scene-surface')!.style.backgroundImage;
  const districts = districtManifest.cities.臺北市.districts;
  if (district in districts) {
    const slug = districts[district as keyof typeof districts].slug;
    expect(background).toContain('background-taipei-' + slug + '-overcast-');
  } else {
    expect(background).toContain('/shared/');
    expect(background).toContain('overcast');
  }
  expect(background).not.toContain('thunderstorm');
});

test('first-load failure is honest, does not block drawing, and retries in the same bucket', async () => {
  chooseLocation('松山區');
  const { container } = render(<App />);
  await act(async () => {
    document.querySelector('script[data-cwa-town-script]')?.dispatchEvent(new Event('error'));
  });
  expect(screen.getByText('天氣資料暫時無法取得')).toBeInTheDocument();
  expect(screen.queryByText(/現在 22°/)).not.toBeInTheDocument();
  expect(container.querySelector<HTMLElement>('.scene-surface')!.style.backgroundImage).toContain('default');
  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  expect(screen.getByRole('button', { name: '決定今日命運' })).toBeEnabled();
  await act(async () => { window.dispatchEvent(new Event('focus')); });
  await deliverForecast();
  expect(screen.getByText(/預報 · 陰 20°/)).toBeInTheDocument();
});

test('a failed refresh labels last-good weather without flashing a fake thunderstorm', async () => {
  chooseLocation('士林區');
  const { container } = render(<App />);
  await deliverForecast();
  const background = container.querySelector<HTMLElement>('.scene-surface')!.style.backgroundImage;
  await act(async () => { await vi.advanceTimersByTimeAsync(15 * 60 * 1000); });
  expect(screen.queryByText(/正在讀取天氣/)).not.toBeInTheDocument();
  await act(async () => {
    document.querySelector('script[data-cwa-town-script]')!.dispatchEvent(new Event('error'));
  });
  expect(screen.getByText('預報待更新，以上為上次資料')).toBeInTheDocument();
  expect(container.querySelector<HTMLElement>('.scene-surface')!.style.backgroundImage).toBe(background);
  expect(screen.queryByText(/短暫陣雨或雷雨/)).not.toBeInTheDocument();
});

test('city-only selection does not fabricate district weather or start a request', async () => {
  chooseLocation(null);
  render(<App />);
  await act(async () => {});
  expect(screen.getByText('天氣資料暫時無法取得')).toBeInTheDocument();
  expect(document.querySelector('script[data-cwa-town-script]')).toBeNull();
});
