import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders expedition board title and start button', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: '今天吃什麼：命運遠征' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '開啟今日遠征' }),
  ).toBeInTheDocument();
});
