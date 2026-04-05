import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('shows a tarot card back before revealing the card front', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  expect(screen.getByLabelText('命運卡卡背')).toBeInTheDocument();
  expect(screen.queryByText(/命運卡：/)).not.toBeInTheDocument();

  expect(
    await screen.findByText(/命運卡：/, {}, { timeout: 2500 }),
  ).toBeInTheDocument();
});
