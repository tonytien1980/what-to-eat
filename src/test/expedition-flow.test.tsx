import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

test('starts an expedition and reveals a destination', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  expect(await screen.findByText(/本日遠征目的地/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '出發去吃' })).toBeInTheDocument();
});
