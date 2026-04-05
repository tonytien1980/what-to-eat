import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

test('allows a single reroll when the round grants reroll power', async () => {
  const randomSpy = vi
    .spyOn(Math, 'random')
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);

  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: '開啟今日遠征' }));

  const rerollButton = await screen.findByRole('button', { name: '逆天改命' });
  expect(rerollButton).toBeEnabled();

  await user.click(rerollButton);

  expect(screen.getByRole('button', { name: '逆天改命' })).toBeDisabled();

  randomSpy.mockRestore();
});
