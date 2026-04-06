import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders expedition board title and start button', () => {
  render(<App />);

  expect(screen.getByText('今天吃什麼')).toBeInTheDocument();
  expect(screen.getByText('命運遠征')).toBeInTheDocument();
  expect(screen.getByText('目前遠征地：臺北市中山區')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '更改位置' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '先選遠征類型' })).toBeInTheDocument();
  expect(screen.getByText('請先選擇遠征類型')).toBeInTheDocument();
  expect(screen.getByLabelText(/遠征卡背/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '先選遠征類型' })).toBeDisabled();
  expect(
    screen.queryByText('中央氣象署 36 小時縣市預報'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Google Sheet 即時資料')).not.toBeInTheDocument();
});

test('opens the lightweight location correction sheet', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '更改位置' }));

  expect(screen.getByText('更改遠征地')).toBeInTheDocument();
  expect(screen.getByLabelText('城市')).toBeInTheDocument();
  expect(screen.getByLabelText('地區')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '略過地區' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '儲存並套用' })).toBeInTheDocument();
});

test('updates the visible candidate count when category changes', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '晚餐' }));
  expect(screen.getByText('晚餐遠征 · 可抽 4 家')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '開啟今日遠征' })).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: '飲料' }));
  expect(screen.getByText('飲料遠征 · 可抽 15 家')).toBeInTheDocument();
});
