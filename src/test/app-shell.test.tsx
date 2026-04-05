import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders expedition board title and start button', () => {
  render(<App />);

  expect(screen.getByText('今天吃什麼')).toBeInTheDocument();
  expect(screen.getByText('命運遠征')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '開啟今日遠征' }),
  ).toBeInTheDocument();
  expect(screen.getByText('午餐遠征 · 可抽 39 家')).toBeInTheDocument();
  expect(screen.getByLabelText(/遠征卡背/)).toBeInTheDocument();
  expect(
    screen.queryByText('中央氣象署 36 小時縣市預報'),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Google Sheet 即時資料')).not.toBeInTheDocument();
});
