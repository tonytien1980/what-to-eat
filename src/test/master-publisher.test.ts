import { expect, test } from 'vitest';
import { createPublisherHarness, headers, shopRow } from './helpers/master-publisher';

test('missing is_enabled never clears any publish tab', () => {
  const h = createPublisherHarness(); h.state.master[0][11] = 'wrong';
  h.call('publishMasterToRuntime');
  expect(h.legacyWrite).not.toHaveBeenCalled();
  expect(h.batchUpdate).not.toHaveBeenCalled();
  expect(h.ui.alert.mock.calls.flat().join(' ')).toContain('is_enabled');
});

test.each(['empty', 'disabled', 'invalid-flag', 'no-category', 'missing-shop', 'missing-maplink', 'duplicate-header'])('blocks unsafe master: %s', mode => {
  const h = createPublisherHarness();
  if (mode === 'empty') h.state.master = [[...headers]];
  if (mode === 'disabled') h.state.master[1][11] = false;
  if (mode === 'invalid-flag') h.state.master[1][11] = 'tru';
  if (mode === 'no-category') h.state.master[1].splice(7, 4, false, false, false, false);
  if (mode === 'missing-shop') h.state.master[1][0] = '';
  if (mode === 'missing-maplink') h.state.master[1][1] = '';
  if (mode === 'duplicate-header') h.state.master[0].push('shop');
  expect(h.call('publishMasterToRuntime').status).toBe('blocked');
  expect(h.batchUpdate).not.toHaveBeenCalled();
  expect(h.legacyWrite).not.toHaveBeenCalled();
});

test('cancellation and unavailable lock do not submit writes', () => {
  const cancelled = createPublisherHarness(); cancelled.state.allow = false;
  expect(cancelled.call('publishMasterToRuntime').status).toBe('cancelled');
  expect(cancelled.batchUpdate).not.toHaveBeenCalled();
  const busy = createPublisherHarness(); busy.state.lockAvailable = false;
  expect(busy.call('publishMasterToRuntime').status).toBe('blocked');
  expect(busy.batchUpdate).not.toHaveBeenCalled();
  expect(busy.releaseLock).not.toHaveBeenCalled();
});

test.each(['master', 'publish'])('revalidates %s after the confirmation dialog', kind => {
  const h = createPublisherHarness();
  h.state.onConfirm = () => {
    if (kind === 'master') h.state.master[1][0] = '確認期間改名';
    else h.state.tabs[0].values[1][0] = '他人改動';
  };
  expect(h.call('publishMasterToRuntime').status).toBe('blocked');
  expect(h.batchUpdate).not.toHaveBeenCalled();
  expect(h.events.indexOf('lock')).toBeGreaterThan(h.events.indexOf('confirm'));
  expect(h.releaseLock).toHaveBeenCalledOnce();
});

test('preflights all destination tabs and rejects wrong publish headers', () => {
  for (const missing of [true, false]) {
    const h = createPublisherHarness();
    if (missing) h.state.tabs.pop(); else h.state.tabs[3].values[0][0] = 'wrong';
    expect(h.call('publishMasterToRuntime').status).toBe('blocked');
    expect(h.batchUpdate).not.toHaveBeenCalled();
  }
});

test('one batch updates four tabs, clears stale rows, preserves other columns, and verifies before success', () => {
  const h = createPublisherHarness();
  h.state.tabs[0].values.push([...h.state.tabs[0].values[1]]);
  expect(h.call('publishMasterToRuntime').status).toBe('published');
  expect(h.batchUpdate).toHaveBeenCalledOnce();
  expect(h.batchUpdate).toHaveBeenCalledWith(expect.anything(), '1bVR4JtMgJTsDs3qPgPDZexZeOP-0qLhhLolwqDYNt7k');
  expect(h.legacyWrite).not.toHaveBeenCalled();
  const requests = h.batchUpdate.mock.calls[0][0].requests;
  expect(requests.filter(r => r.updateCells)).toHaveLength(4);
  for (const request of requests.filter(r => r.updateCells)) {
    expect(request.updateCells.fields).toBe('userEnteredValue');
    expect(request.updateCells.range.endColumnIndex).toBe(7);
  }
  expect(h.state.tabs[0].values[1].slice(0, 7)).toEqual(shopRow.slice(0, 7));
  expect(h.state.tabs[0].values[1][7]).toBe('保留的備註');
  expect(h.state.tabs[0].values[2].slice(0, 7).every(c => c === '')).toBe(true);
  expect(h.ui.alert.mock.calls.flat().join(' ')).toContain('將清空');
  expect(h.releaseLock).toHaveBeenCalledOnce();
  expect(h.events.at(-2)).toBe('release');
});

test('grows a full sheet inside the same batch and writes formula-like names as literal strings', () => {
  const h = createPublisherHarness();
  h.state.tabs[0].gridProperties.rowCount = 1;
  h.state.master[1][0] = '=IMPORTXML("https://example.invalid","//x")';
  expect(h.call('publishMasterToRuntime').status).toBe('published');
  const requests = h.batchUpdate.mock.calls[0][0].requests;
  expect(requests.some(r => r.appendDimension?.dimension === 'ROWS')).toBe(true);
  const cells = requests.find(r => r.updateCells)?.updateCells.rows[1].values;
  expect(cells[0].userEnteredValue).toEqual({ stringValue: h.state.master[1][0] });
});

test.each(['failBatch', 'failAfterApply', 'mismatchReadback', 'failReadback'] as const)('does not claim success or blindly retry on %s', failure => {
  const h = createPublisherHarness(); h.state[failure] = true;
  expect(h.call('publishMasterToRuntime').status).toBe('unknown');
  expect(h.batchUpdate).toHaveBeenCalledOnce();
  expect(h.legacyWrite).not.toHaveBeenCalled();
  expect(h.ui.alert.mock.calls.some(args => args[0] === 'Master Sync 發布完成')).toBe(false);
  expect(h.releaseLock).toHaveBeenCalledOnce();
});

test('preview is read-only and uses the same schema validation', () => {
  const h = createPublisherHarness();
  h.call('previewMasterPublishSync');
  expect(h.batchUpdate).not.toHaveBeenCalled();
  expect(h.legacyWrite).not.toHaveBeenCalled();
  h.state.master[0][11] = 'wrong';
  h.call('previewMasterPublishSync');
  expect(h.ui.alert.mock.calls.flat().join(' ')).toContain('is_enabled');
});

test('missing advanced service stops before confirmation or writes', () => {
  const h = createPublisherHarness(); delete h.context.Sheets;
  expect(h.call('publishMasterToRuntime').status).toBe('blocked');
  expect(h.events).not.toContain('confirm');
  expect(h.batchUpdate).not.toHaveBeenCalled();
});

test('native batch failure leaves simulated original data untouched', () => {
  const h = createPublisherHarness(); const before = JSON.stringify(h.state.tabs);
  h.state.failBatch = true;
  h.call('publishMasterToRuntime');
  expect(JSON.stringify(h.state.tabs)).toBe(before);
  expect(h.batchUpdate).toHaveBeenCalledOnce();
});

test('canceling a proposed category clear preserves old contents', () => {
  const h = createPublisherHarness(); h.state.allow = false;
  const before = JSON.stringify(h.state.tabs);
  h.call('publishMasterToRuntime');
  expect(JSON.stringify(h.state.tabs)).toBe(before);
  expect(h.batchUpdate).not.toHaveBeenCalled();
  expect(h.ui.alert.mock.calls[0][1]).toContain('將清空');
});

test('metadata key order alone does not invalidate the confirmed plan', () => {
  const h = createPublisherHarness();
  h.state.onConfirm = () => {
    h.context.Sheets.Spreadsheets.get.mockImplementation(() => ({ sheets: h.state.tabs.map(tab => ({ properties: {
      title: tab.title, sheetType: tab.sheetType, sheetId: tab.sheetId,
      gridProperties: { columnCount: tab.gridProperties.columnCount, rowCount: tab.gridProperties.rowCount },
    } })) }));
  };
  expect(h.call('publishMasterToRuntime').status).toBe('published');
});

test('a blank narrow grid is read within bounds before atomically expanding to seven columns', () => {
  const h = createPublisherHarness();
  h.state.tabs[0].gridProperties.columnCount = 1;
  h.state.tabs[0].values = [];
  expect(h.call('publishMasterToRuntime').status).toBe('published');
  const reads = h.context.Sheets.Spreadsheets.Values.batchGet.mock.calls;
  expect(reads[0][1].ranges[0]).toBe("'午餐'!A:A");
  expect(reads.at(-1)[1].ranges[0]).toBe("'午餐'!A:G");
  expect(h.batchUpdate.mock.calls[0][0].requests).toContainEqual({ appendDimension: { sheetId: 0, dimension: 'COLUMNS', length: 6 } });
});
