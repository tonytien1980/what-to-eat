import { expect, test } from 'vitest';
import { createPublisherHarness, headers, shopRow } from './helpers/master-publisher';

test.each(headers)('every required header is checked before using %s', header => {
  const h = createPublisherHarness();
  const incomplete = headers.filter(name => name !== header);
  expect(() => h.call('buildMasterPublishSummary_', [incomplete, shopRow])).toThrow(header);
});

test('missing metadata cells remain warnings while required headers are mandatory', () => {
  const h = createPublisherHarness();
  const row = [...shopRow]; row.splice(4, 3, '', '', '');
  const summary = h.call('buildMasterPublishSummary_', [headers, row]);
  expect(summary.blockingErrors).toEqual([]);
  expect(summary.warnings.map((issue: { field: string }) => issue.field)).toEqual(['lat', 'lng', 'placeid']);
  expect(() => h.call('buildMasterPublishSummary_', [headers.filter(x => x !== 'lat'), row])).toThrow(/lat/);
});

test('one enabled row fans out to multiple categories using a stable seven-column contract', () => {
  const h = createPublisherHarness();
  const summary = h.call('buildMasterPublishSummary_', [headers, shopRow]);
  expect(summary.publishRows.lunch).toEqual([shopRow.slice(0, 7)]);
  expect(summary.publishRows.dinner).toEqual([shopRow.slice(0, 7)]);
  expect(summary.publishRows.drinks).toEqual([]);
});

test('preserves ordering and complete-leading-row behavior', () => {
  const h = createPublisherHarness();
  const incomplete = [...shopRow]; incomplete[0] = 'A店'; incomplete[4] = '';
  const complete = [...shopRow]; complete[0] = 'B店';
  const summary = h.call('buildMasterPublishSummary_', [headers, incomplete, complete]);
  expect(summary.publishRows.lunch.map((r: string[]) => r[0])).toEqual(['B店', 'A店']);
});

test('accepts checkbox booleans and explicit CSV false, but rejects blank flags', () => {
  const h = createPublisherHarness();
  const disabled = [...shopRow]; disabled[11] = 'FALSE';
  expect(h.call('buildMasterPublishSummary_', [headers, disabled, shopRow]).publishCounts.lunch).toBe(1);
  disabled[11] = '';
  expect(() => h.call('buildMasterPublishSummary_', [headers, disabled])).toThrow(/is_enabled/);
});

test('ignores unused unchecked rows identically in CSV and native checkbox values', () => {
  const h = createPublisherHarness();
  const blank = ['', '', '', '', '', '', '', false, false, false, false, false];
  const native = h.call('buildMasterPublishSummary_', [headers, shopRow, blank]);
  const csv = h.call('buildMasterPublishSummary_', [headers, shopRow, blank.map(value => value === false ? 'FALSE' : value)]);
  expect(native.masterRowCount).toBe(1);
  expect(csv).toEqual(native);
});
