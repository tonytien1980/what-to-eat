import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('always allows one reroll even when the first round is not a reroll card', async () => {
  const randomSpy = vi
    .spyOn(Math, 'random')
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.9995)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0);

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '午餐' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟今日遠征' }));
  await screen.findByRole('link', { name: '出發去吃' }, { timeout: 4000 });

  const rerollButton = screen.getByRole('button', { name: '再抽一次' });
  expect(rerollButton).toBeEnabled();

  fireEvent.click(rerollButton);
  expect(screen.getByLabelText('遠征卡背 card-back-hidden')).toBeInTheDocument();
  await screen.findByRole('link', { name: '出發去吃' }, { timeout: 4000 });

  expect(screen.getByRole('button', { name: '重選次數已用盡' })).toBeDisabled();

  randomSpy.mockRestore();
}, 9000);
