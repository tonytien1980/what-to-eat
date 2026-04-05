# 今天吃什麼 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-login fantasy lunch picker MVP that draws a destiny card, spins a valid restaurant pool, and launches the chosen map destination.

**Architecture:** Use a static-friendly Vite + React + TypeScript frontend with JSON restaurant data and small feature modules for restaurant selection, destiny card filtering, and expedition state. Keep gameplay logic in testable utility modules and keep UI copy aligned with the docs in `docs/`.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library

---

## File Structure

- `package.json`: frontend scripts and dependencies
- `tsconfig*.json`: TypeScript config
- `vite.config.ts`: Vite runtime config
- `vitest.config.ts`: test config
- `index.html`: app entry shell
- `src/main.tsx`: React bootstrap
- `src/App.tsx`: top-level app orchestration
- `src/styles.css`: global fantasy UI styling
- `src/features/restaurants/data.ts`: restaurant data loading
- `src/features/restaurants/selectors.ts`: pool and fallback logic
- `src/features/destiny/cards.ts`: destiny card definitions
- `src/features/destiny/draw.ts`: destiny card draw logic
- `src/features/spin/useExpedition.ts`: expedition state flow
- `src/features/result/result-copy.ts`: result labels and summaries
- `src/test/*.test.ts`: behavior tests
- `data/restaurants.json`: MVP restaurant data
- `docs/*.md`: active synced docs

### Task 1: Bootstrap The App Shell

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Test: `src/test/app-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders expedition board title and start button', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: '今天吃什麼：命運遠征' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '開啟今日遠征' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/app-shell.test.tsx`
Expected: FAIL because app files do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
export default function App() {
  return (
    <main>
      <h1>今天吃什麼：命運遠征</h1>
      <button type="button">開啟今日遠征</button>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/app-shell.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts vitest.config.ts index.html src/main.tsx src/App.tsx src/styles.css src/test/app-shell.test.tsx
git commit -m "feat: bootstrap expedition app shell"
```

### Task 2: Add Restaurant Data And Pool Selection Logic

**Files:**
- Create: `data/restaurants.json`
- Create: `src/features/restaurants/data.ts`
- Create: `src/features/restaurants/selectors.ts`
- Test: `src/test/restaurant-selection.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import restaurants from '../../data/restaurants.json';
import { getCandidatePool } from '../features/restaurants/selectors';

test('filters active category and enabled restaurants', () => {
  const pool = getCandidatePool(restaurants, 'lunch');

  expect(pool.every((item) => item.category === 'lunch')).toBe(true);
  expect(pool.every((item) => item.isEnabled)).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/restaurant-selection.test.ts`
Expected: FAIL because the data module and selector do not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function getCandidatePool(restaurants, category) {
  return restaurants.filter((item) => item.category === category && item.isEnabled);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/restaurant-selection.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add data/restaurants.json src/features/restaurants/data.ts src/features/restaurants/selectors.ts src/test/restaurant-selection.test.ts
git commit -m "feat: add restaurant pool selection"
```

### Task 3: Add Destiny Card Rules And Fallback Filtering

**Files:**
- Create: `src/features/destiny/cards.ts`
- Create: `src/features/destiny/draw.ts`
- Modify: `src/features/restaurants/selectors.ts`
- Test: `src/test/destiny-filtering.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import restaurants from '../../data/restaurants.json';
import { destinyCards } from '../features/destiny/cards';
import { getDestinationPool } from '../features/restaurants/selectors';

test('falls back to category pool when card filter removes every candidate', () => {
  const card = destinyCards.find((item) => item.id === 'swift-wind');
  const pool = getDestinationPool(restaurants, 'sweets', card);

  expect(pool.length).toBeGreaterThan(0);
  expect(pool.every((item) => item.category === 'sweets')).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/destiny-filtering.test.ts`
Expected: FAIL because destination filtering is not implemented yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function getDestinationPool(restaurants, category, card) {
  const basePool = getCandidatePool(restaurants, category);
  const filteredPool = applyCardFilter(basePool, card);
  return filteredPool.length > 0 ? filteredPool : basePool;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/destiny-filtering.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/destiny/cards.ts src/features/destiny/draw.ts src/features/restaurants/selectors.ts src/test/destiny-filtering.test.ts
git commit -m "feat: add destiny card filtering"
```

### Task 4: Implement Expedition State And Result Flow

**Files:**
- Create: `src/features/spin/useExpedition.ts`
- Create: `src/features/result/result-copy.ts`
- Modify: `src/App.tsx`
- Test: `src/test/expedition-flow.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/expedition-flow.test.tsx`
Expected: FAIL because expedition flow and result UI do not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
const result = startExpedition(category);

setRound(result);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/expedition-flow.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/spin/useExpedition.ts src/features/result/result-copy.ts src/App.tsx src/test/expedition-flow.test.tsx
git commit -m "feat: add expedition result flow"
```

### Task 5: Add Visual Polish, Reroll Logic, And Docs Sync

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `docs/00_product_definition_and_current_state.md`
- Modify: `docs/01_runtime_architecture_and_data_contracts.md`
- Modify: `docs/02_ux_gameplay_and_content_spec.md`
- Modify: `docs/03_qa_and_release_checklist.md`
- Test: `src/test/reroll.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

test('allows a single reroll after the first result', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: '開啟今日遠征' }));
  const rerollButton = await screen.findByRole('button', { name: '逆天改命' });

  expect(rerollButton).toBeEnabled();
  await user.click(rerollButton);
  expect(screen.getByRole('button', { name: '逆天改命' })).toBeDisabled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/reroll.test.tsx`
Expected: FAIL because reroll state is not implemented yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [hasRerolled, setHasRerolled] = useState(false);
const canReroll = Boolean(round) && !hasRerolled;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/reroll.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/styles.css docs/00_product_definition_and_current_state.md docs/01_runtime_architecture_and_data_contracts.md docs/02_ux_gameplay_and_content_spec.md docs/03_qa_and_release_checklist.md src/test/reroll.test.tsx
git commit -m "feat: polish expedition flow and reroll"
```

### Task 6: Verify And Prepare GitHub Sync

**Files:**
- Modify: `README.md`
- Modify: `docs/03_qa_and_release_checklist.md`

- [ ] **Step 1: Run full verification**

Run: `npm test -- --run && npm run build`
Expected: PASS with zero failing tests and successful production build.

- [ ] **Step 2: Update setup docs if commands differ from assumptions**

```md
If verification commands or setup steps changed, update README and docs/03_qa_and_release_checklist.md before staging.
```

- [ ] **Step 3: Stage final repo state**

```bash
git add README.md docs/03_qa_and_release_checklist.md
```

- [ ] **Step 4: Commit final MVP state**

```bash
git commit -m "docs: finalize mvp setup and verification notes"
```

- [ ] **Step 5: Push feature branch**

```bash
git push -u origin codex/initial-mvp
```
