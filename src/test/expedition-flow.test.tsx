import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('starts an expedition and reveals a destination', async () => {
  render(<App />);

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
