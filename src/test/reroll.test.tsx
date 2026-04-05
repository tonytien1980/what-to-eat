import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('allows a single reroll when the round grants reroll power', async () => {
  const randomSpy = vi
    .spyOn(Math, 'random')
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));
  await screen.findByText(/本日遠征目的地/, {}, { timeout: 2500 });

  const rerollButton = screen.getByRole('button', { name: '逆天改命' });
  expect(rerollButton).toBeEnabled();

  fireEvent.click(rerollButton);
  expect(screen.getAllByText('命運卡揭示中')).toHaveLength(2);
  await screen.findByText(/本日遠征目的地/, {}, { timeout: 2500 });

  expect(screen.getByRole('button', { name: '逆天改命已用盡' })).toBeDisabled();

  randomSpy.mockRestore();
});
