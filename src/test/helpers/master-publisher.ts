import vm from 'node:vm';
import { vi } from 'vitest';
import source from '../../../apps-script/master-publish-sync/Code.gs?raw';

export type Cell = string | number | boolean;
export const headers = ['shop', 'maplink', 'city', 'district', 'lat', 'lng', 'placeid', 'is_lunch', 'is_dinner', 'is_drink', 'is_sweet', 'is_enabled'];
export const shopRow: Cell[] = ['測試店', 'https://maps.google.com/?q=test', '臺北市', '松山區', 25.05, 121.56, 'test-place', true, true, false, false, true];
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function createPublisherHarness() {
  const state = {
    master: [headers, shopRow].map(row => [...row]) as Cell[][],
    tabs: ['午餐', '晚餐', '飲料', '甜點'].map((title, sheetId) => ({
      sheetId, title, sheetType: 'GRID', gridProperties: { rowCount: 8, columnCount: 8 },
      values: [headers.slice(0, 7), ['舊店', 'https://maps.google.com/?q=old', '臺北市', '松山區', 25, 121, 'old', '保留的備註']] as Cell[][],
    })),
    allow: true,
    lockAvailable: true,
    failBatch: false,
    failAfterApply: false,
    mismatchReadback: false,
    failReadback: false,
    submitted: false,
    onConfirm: () => {},
  };
  const events: string[] = [];
  const legacyWrite = vi.fn();
  const releaseLock = vi.fn(() => events.push('release'));
  const ui = {
    Button: { YES: 'YES', NO: 'NO' }, ButtonSet: { YES_NO: 'YES_NO', OK: 'OK' },
    alert: vi.fn((...args: unknown[]) => {
      if (args[2] === 'YES_NO') {
        events.push('confirm'); state.onConfirm(); return state.allow ? 'YES' : 'NO';
      }
      events.push('alert'); return 'OK';
    }),
  };
  const batchGet = vi.fn(() => {
    if (state.submitted && state.failReadback) throw new Error('readback unavailable');
    return { valueRanges: state.tabs.map(tab => ({ values: copy(tab.values) })) };
  });
  const batchUpdate = vi.fn((body: { requests: Record<string, any>[] }) => {
    events.push('batch'); state.submitted = true;
    if (state.failBatch) throw new Error('batch rejected');
    // Simulates the native API contract; production atomicity is not proven by this double.
    const tabs = copy(state.tabs);
    for (const request of body.requests) {
      if (request.appendDimension) {
        const value = request.appendDimension;
        const tab = tabs.find(t => t.sheetId === value.sheetId)!;
        if (value.dimension === 'ROWS') tab.gridProperties.rowCount += value.length;
        else tab.gridProperties.columnCount += value.length;
      } else {
        const value = request.updateCells;
        const tab = tabs.find(t => t.sheetId === value.range.sheetId)!;
        if (value.range.endRowIndex > tab.gridProperties.rowCount) throw new Error('out of bounds');
        for (let r = value.range.startRowIndex; r < value.range.endRowIndex; r++) {
          tab.values[r] ??= [];
          for (let c = value.range.startColumnIndex; c < value.range.endColumnIndex; c++) {
            const entered = value.rows[r]?.values[c]?.userEnteredValue;
            tab.values[r][c] = entered?.stringValue ?? entered?.numberValue ?? '';
          }
        }
      }
    }
    state.tabs = tabs;
    if (state.mismatchReadback) state.tabs[0].values[1][0] = '不同資料';
    if (state.failAfterApply) throw new Error('response lost after apply');
    return {};
  });
  const context = vm.createContext({
    SpreadsheetApp: {
      getUi: () => ui,
      // Only for the red phase: the original implementation must actually reach its unsafe writes.
      openById: (id: string) => ({ getSheetByName: (name: string) =>
        id.startsWith('11Q8') ? { getDataRange: () => ({ getValues: () => copy(state.master) }) } :
          state.tabs.some(t => t.title === name) ? { getMaxRows: () => 8, getRange: () => ({ setValues: legacyWrite, clearContent: legacyWrite }) } : null,
      }),
    },
    LockService: { getScriptLock: () => ({ tryLock: () => { events.push('lock'); return state.lockAvailable; }, releaseLock }) },
    Sheets: { Spreadsheets: {
      get: vi.fn(() => ({ sheets: state.tabs.map(({ values: _values, ...properties }) => ({ properties: copy(properties) })) })),
      Values: { get: vi.fn(() => ({ values: copy(state.master) })), batchGet },
      batchUpdate,
    } },
  });
  vm.runInContext(source, context);
  return {
    state, ui, events, legacyWrite, releaseLock, batchUpdate, context,
    call: (name: string, ...args: unknown[]) => {
      context.__args = args;
      return vm.runInContext(`${name}(...__args)`, context);
    },
  };
}
