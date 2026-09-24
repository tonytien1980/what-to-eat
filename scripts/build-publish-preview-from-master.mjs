import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const outputDirectory = fileURLToPath(new URL('../output/master-publish-preview/', import.meta.url));
// Execute only the checked-in publisher definitions, never CSV contents or remote scripts.
const publisherSource = await readFile(new URL('../apps-script/master-publish-sync/Code.gs', import.meta.url), 'utf8');
const publisher = vm.runInNewContext(`${publisherSource}\n({ config: MASTER_SYNC_CONFIG, summarize: buildMasterPublishSummary_ })`, {}, { timeout: 1000 });

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === ',') {
      row.push(cell.trim()); cell = '';
    } else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('Master CSV has an unterminated quoted cell.');
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
  return rows;
}

function toCsv(rows) {
  return rows.map(row => row.map(value => {
    const cell = String(value ?? '');
    return /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
  }).join(',')).join('\n') + '\n';
}

export async function writePublishPreview(csvText, directory = outputDirectory) {
  const { publishRows, ...validation } = publisher.summarize(parseCsv(csvText));
  if (validation.blockingErrors.length) {
    throw new Error(validation.blockingErrors.map(issue => `${issue.shop}: ${issue.message}`).join('\n'));
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    masterSpreadsheetId: publisher.config.masterSpreadsheetId,
    ...validation,
  };
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  for (const [category, tabName] of Object.entries(publisher.config.publishTabs)) {
    await writeFile(join(directory, `${category}.csv`), toCsv([publisher.config.publishHeaders, ...publishRows[category]]));
    await writeFile(join(directory, `${category}.json`), JSON.stringify({ tabName, rows: publishRows[category] }, null, 2) + '\n');
  }
  return summary;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const masterUrl = `https://docs.google.com/spreadsheets/d/${publisher.config.masterSpreadsheetId}/export?format=csv&gid=0`;
  const response = await fetch(masterUrl);
  if (!response.ok) throw new Error(`Failed to fetch master: ${response.status}`);
  const summary = await writePublishPreview(await response.text());
  console.log(`Previewed ${summary.masterRowCount} master rows: ${JSON.stringify(summary.publishCounts)}; warnings ${summary.warnings.length}`);
}
