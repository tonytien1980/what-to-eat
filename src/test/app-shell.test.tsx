import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { createDefaultLocationPreference } from '../features/location/storage';
import { restaurants } from '../features/restaurants/data';
import { getLocationAwareCandidatePool } from '../features/restaurants/selectors';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders expedition board title and start button', () => {
  render(<App />);

  expect(screen.getByText('今天吃什麼')).toBeInTheDocument();
  expect(screen.getByText('命運遠征')).toBeInTheDocument();
  expect(screen.getByText('預計冒險地：')).toBeInTheDocument();
  expect(screen.getByText('臺北市中山區')).toBeInTheDocument();
  expect(screen.getByText('預計冒險地 3 小時天氣預報')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '更改預計冒險地' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '準備好了嗎？' })).toBeInTheDocument();
  expect(screen.getByText('請先選擇冒險方向')).toBeInTheDocument();
  expect(screen.getByLabelText(/遠征卡背/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '準備好了嗎？' })).toBeDisabled();
  expect(
    screen.queryByText('中央氣象署 36 小時縣市預報'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Google Sheet 即時資料')).not.toBeInTheDocument();
  expect(screen.queryByText(/^臺北市中山區 ·/)).not.toBeInTheDocument();
});

test('opens the lightweight location correction sheet', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '更改預計冒險地' }));

  expect(
    screen.getByRole('heading', { name: '更改預計冒險地' }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText('城市')).toBeInTheDocument();
  expect(screen.getByLabelText('地區')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '略過地區' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '儲存並套用' })).toBeInTheDocument();
});

test('updates the visible candidate count when category changes', () => {
  const defaultLocation = createDefaultLocationPreference();
  const dinnerCount = getLocationAwareCandidatePool(
    restaurants,
    'dinner',
    defaultLocation,
  ).length;
  const drinksCount = getLocationAwareCandidatePool(
    restaurants,
    'drinks',
    defaultLocation,
  ).length;

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '晚餐' }));
  expect(screen.getByText(`晚餐遠征 · 可抽 ${dinnerCount} 家`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '決定今日命運' })).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: '飲料' }));
  expect(screen.getByText(`飲料遠征 · 可抽 ${drinksCount} 家`)).toBeInTheDocument();
});

test('keeps an explicit district selection on refresh-like load and disables categories with zero candidates in that district', () => {
  const preservedDistrict = '測試區';

  window.localStorage.setItem(
    'what-to-eat:location-preference',
    JSON.stringify({
      city: '臺北市',
      district: preservedDistrict,
      source: 'manual',
      promptState: 'accepted',
      savedAt: '2026-04-08T00:00:00.000Z',
    }),
  );

  render(<App />);

  expect(screen.getByText('預計冒險地：')).toBeInTheDocument();
  expect(screen.getByText(`臺北市${preservedDistrict}`)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '晚餐' }));
  expect(screen.getByText('晚餐遠征 · 可抽 0 家')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '目前沒有可用據點' })).toBeDisabled();
});
