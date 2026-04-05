import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('starts an expedition and reveals a destination', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  expect(screen.getAllByText('命運卡揭示中')).toHaveLength(2);
  expect(screen.getByText(/命運卡：/)).toBeInTheDocument();
  expect(screen.queryByText(/本日遠征目的地/)).not.toBeInTheDocument();

  expect(
    await screen.findByText(/本日遠征目的地/, {}, { timeout: 2500 }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '出發去吃' })).toBeInTheDocument();
});
