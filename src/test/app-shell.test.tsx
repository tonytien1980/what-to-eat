import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders expedition board title and start button', () => {
  render(<App />);

  expect(screen.getByText('今天吃什麼')).toBeInTheDocument();
  expect(screen.getByText('命運遠征')).toBeInTheDocument();
  expect(screen.getByText((content) => content.includes('預計冒險地：臺北市中山區'))).toBeInTheDocument();
  expect(screen.getByText('預計冒險地 3 小時天氣預報')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '更改預計冒險地' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '你準備好了嗎？' })).toBeInTheDocument();
  expect(screen.getByText('請先選擇冒險目的')).toBeInTheDocument();
  expect(screen.getByLabelText(/遠征卡背/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '你準備好了嗎？' })).toBeDisabled();
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
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '晚餐' }));
  expect(screen.getByText('晚餐遠征 · 可抽 4 家')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '決定今日命運' })).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: '飲料' }));
  expect(screen.getByText('飲料遠征 · 可抽 15 家')).toBeInTheDocument();
});
