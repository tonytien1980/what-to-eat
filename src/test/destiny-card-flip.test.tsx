import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('shows a tarot card back before revealing the card front', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '決定今日命運' }));

  expect(screen.getByLabelText(/遠征卡背/)).toBeInTheDocument();
  expect(screen.queryByText(/命運卡：/)).not.toBeInTheDocument();
  expect(screen.queryByText('本日遠征目的地')).not.toBeInTheDocument();

  expect(await screen.findByText('今日遠征地', {}, { timeout: 4000 })).toBeInTheDocument();
});
