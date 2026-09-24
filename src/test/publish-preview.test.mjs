// @vitest-environment node
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { writePublishPreview } from '../../scripts/build-publish-preview-from-master.mjs';

const header = 'shop,maplink,city,district,lat,lng,placeid,is_lunch,is_dinner,is_drink,is_sweet,is_enabled';
const row = 'Test,https://maps.google.com,臺北市,松山區,25,121,p1,TRUE,TRUE,FALSE,FALSE,TRUE';

test('CLI preview applies the same missing-flag and empty-master guards before exporting', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'what-to-eat-preview-'));
  await expect(writePublishPreview(header.replace('is_enabled', 'wrong') + '\n' + row, directory)).rejects.toThrow(/is_enabled/);
  await expect(writePublishPreview(header, directory)).rejects.toThrow(/清空/);
  await expect(writePublishPreview(header + '\n"broken', directory)).rejects.toThrow(/unterminated/);
  expect(await readdir(directory)).toEqual([]);
});

test('CLI preview exports the canonical seven-column fan-out without external calls', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'what-to-eat-preview-'));
  const summary = await writePublishPreview(header + '\n' + row, directory);
  expect(summary.publishCounts).toEqual({ lunch: 1, dinner: 1, drinks: 0, sweets: 0 });
  const lunch = JSON.parse(await readFile(join(directory, 'lunch.json'), 'utf8'));
  expect(lunch.rows[0]).toEqual(['Test', 'https://maps.google.com', '臺北市', '松山區', 25, 121, 'p1']);
  expect(await readFile(join(directory, 'lunch.csv'), 'utf8')).toContain('shop,maplink,city,district,lat,lng,placeid');
});
