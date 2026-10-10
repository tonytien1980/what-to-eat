import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('Pages runs regression tests before building and deploying', () => {
  const workflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
  const testStep = workflow.indexOf('run: npm test');
  const buildStep = workflow.indexOf('run: npm run build:pages');
  expect(testStep).toBeGreaterThan(-1);
  expect(buildStep).toBeGreaterThan(testStep);
  expect(workflow).not.toContain('continue-on-error: true');
});
