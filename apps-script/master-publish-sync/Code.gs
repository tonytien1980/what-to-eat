const MASTER_SYNC_CONFIG = {
  masterSpreadsheetId: '11Q8TfeTjvOuDwgX9Ux1kG91pahFcfjC1hA4VO0k4KdM',
  masterSheetName: 'restaurants_master',
  publishSpreadsheetId: '1bVR4JtMgJTsDs3qPgPDZexZeOP-0qLhhLolwqDYNt7k',
  publishTabs: { lunch: '午餐', dinner: '晚餐', drinks: '飲料', sweets: '甜點' },
  publishHeaders: ['shop', 'maplink', 'city', 'district', 'lat', 'lng', 'placeid'],
};
const MASTER_FLAGS = ['is_lunch', 'is_dinner', 'is_drink', 'is_sweet', 'is_enabled'];
const MASTER_HEADERS = [...MASTER_SYNC_CONFIG.publishHeaders, ...MASTER_FLAGS];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Master Sync')
    .addItem('預覽同步摘要', 'previewMasterPublishSync')
    .addItem('發布到前端資料庫', 'publishMasterToRuntime')
    .addToUi();
}

function previewMasterPublishSync() {
  const ui = SpreadsheetApp.getUi();
  try {
    const plan = preparePublish_();
    ui.alert('Master Sync 預覽完成', describePublish_(plan), ui.ButtonSet.OK);
    return { status: 'previewed' };
  } catch (error) {
    ui.alert('Master Sync 預覽中止', String(error.message || error), ui.ButtonSet.OK);
    return { status: 'blocked' };
  }
}

function publishMasterToRuntime() {
  const ui = SpreadsheetApp.getUi();
  let lock;
  let locked = false;
  let submitted = false;
  let result;
  let message;
  try {
    const approved = preparePublish_();
    if (ui.alert('確認發布四個分類表', `${describePublish_(approved)}\n\n確定覆蓋四表 A:G？`, ui.ButtonSet.YES_NO) !== ui.Button.YES) {
      return { status: 'cancelled' };
    }
    // Apps Script dialogs suspend execution and do not preserve locks.
    lock = LockService.getScriptLock();
    locked = lock.tryLock(5000);
    if (!locked) throw new Error('另一個發布正在進行，請稍後重新預覽。');
    const current = preparePublish_();
    if (current.signature !== approved.signature) {
      throw new Error('確認期間 master 或 publish 已變更，請重新預覽並確認。');
    }
    const requests = buildPublishRequests_(current);
    submitted = true;
    Sheets.Spreadsheets.batchUpdate({ requests }, MASTER_SYNC_CONFIG.publishSpreadsheetId);
    const readback = readPublishedValues_(current.targets, true);
    current.targets.forEach((target, index) => {
      const expected = [MASTER_SYNC_CONFIG.publishHeaders, ...current.summary.publishRows[target.category]];
      if (JSON.stringify(readback[index]) !== JSON.stringify(expected)) {
        throw new Error(`${target.title} 寫後核對不符。`);
      }
    });
    result = { status: 'published' };
    message = '四個分類表已寫入並逐值核對一致。';
  } catch (error) {
    result = { status: submitted ? 'unknown' : 'blocked' };
    message = submitted
      ? `發布結果尚未確認，可能已寫入；請勿連續重試。\n先核對 publish 與 master，必要時依試算表版本記錄復原。\n${error.message || error}`
      : `本次未送出寫入。\n${error.message || error}`;
  } finally {
    if (locked) lock.releaseLock();
  }
  ui.alert(result.status === 'published' ? 'Master Sync 發布完成' : 'Master Sync 發布未完成', message, ui.ButtonSet.OK);
  return result;
}

function preparePublish_() {
  if (typeof Sheets === 'undefined') throw new Error('請先啟用 Apps Script 的 Google Sheets API v4 進階服務。');
  const masterValues = Sheets.Spreadsheets.Values.get(
    MASTER_SYNC_CONFIG.masterSpreadsheetId,
    `'${MASTER_SYNC_CONFIG.masterSheetName}'`,
    { valueRenderOption: 'UNFORMATTED_VALUE' },
  ).values || [];
  const summary = buildMasterPublishSummary_(masterValues);
  if (summary.blockingErrors.length) {
    throw new Error(summary.blockingErrors.slice(0, 10).map(issue => `${issue.shop} / ${issue.field}: ${issue.message}`).join('\n'));
  }
  const metadata = Sheets.Spreadsheets.get(MASTER_SYNC_CONFIG.publishSpreadsheetId, {
    fields: 'sheets(properties(sheetId,title,sheetType,gridProperties(rowCount,columnCount)))',
  });
  const targets = Object.entries(MASTER_SYNC_CONFIG.publishTabs).map(([category, title]) => {
    const properties = (metadata.sheets || []).find(sheet => sheet.properties.title === title)?.properties;
    if (!properties || properties.sheetType !== 'GRID' || !properties.gridProperties) {
      throw new Error(`缺少可寫入的 publish 分頁：${title}`);
    }
    return {
      category, title, sheetId: properties.sheetId, sheetType: properties.sheetType,
      gridProperties: {
        rowCount: properties.gridProperties.rowCount,
        columnCount: properties.gridProperties.columnCount,
      },
    };
  });
  const publishedValues = readPublishedValues_(targets);
  targets.forEach((target, index) => {
    target.values = publishedValues[index];
    if (target.values.length && JSON.stringify(target.values[0]) !== JSON.stringify(MASTER_SYNC_CONFIG.publishHeaders)) {
      throw new Error(`${target.title} 的 A:G 表頭不符合 publish contract，請先確認分頁。`);
    }
  });
  return { summary, targets, signature: JSON.stringify({ masterValues, targets }) };
}

function readPublishedValues_(targets, afterWrite = false) {
  const response = Sheets.Spreadsheets.Values.batchGet(MASTER_SYNC_CONFIG.publishSpreadsheetId, {
    ranges: targets.map(target => {
      const endColumn = afterWrite ? 'G' : 'ABCDEFG'[Math.min(7, target.gridProperties.columnCount) - 1];
      return `'${target.title.replace(/'/g, "''")}'!A:${endColumn}`;
    }),
    valueRenderOption: 'UNFORMATTED_VALUE',
  });
  if (!response.valueRanges || response.valueRanges.length !== targets.length) {
    throw new Error('未取得完整的四表資料。');
  }
  return response.valueRanges.map(range => normalizePublishedValues_(range.values || []));
}

function normalizePublishedValues_(rows) {
  const normalized = rows.map(row => MASTER_SYNC_CONFIG.publishHeaders.map((_, index) => row[index] == null ? '' : row[index]));
  while (normalized.length && normalized[normalized.length - 1].every(value => value === '')) normalized.pop();
  return normalized;
}

function describePublish_(plan) {
  return [
    `Master：${plan.summary.masterRowCount} 筆`,
    ...plan.targets.map(target => {
      const before = target.values.slice(1).filter(row => row.some(value => value !== '')).length;
      const after = plan.summary.publishRows[target.category].length;
      const delta = after - before;
      return `${target.title}：${before} → ${after} 筆（淨增減 ${delta >= 0 ? '+' : ''}${delta}）${before > 0 && after === 0 ? '；警告：將清空' : ''}`;
    }),
    `資料缺漏警告：${plan.summary.warnings.length} 項`,
    ...plan.summary.warnings.slice(0, 5).map(issue => `${issue.shop}: ${issue.field}`),
    '筆數相同也可能更新內容；僅覆蓋 A:G 的值，不修改 H 欄之後或儲存格格式。',
    '確認後到發布完成前，請勿手動編輯 master 或 publish。',
  ].join('\n');
}

function buildPublishRequests_(plan) {
  return plan.targets.flatMap(target => {
    const rows = [MASTER_SYNC_CONFIG.publishHeaders, ...plan.summary.publishRows[target.category]];
    const endRowIndex = Math.max(rows.length, target.values.length);
    const requests = [];
    if (endRowIndex > target.gridProperties.rowCount) {
      requests.push({ appendDimension: { sheetId: target.sheetId, dimension: 'ROWS', length: endRowIndex - target.gridProperties.rowCount } });
    }
    if (target.gridProperties.columnCount < 7) {
      requests.push({ appendDimension: { sheetId: target.sheetId, dimension: 'COLUMNS', length: 7 - target.gridProperties.columnCount } });
    }
    // updateCells clears the uncovered tail of this bounded range in the same atomic batch.
    requests.push({ updateCells: {
      range: { sheetId: target.sheetId, startRowIndex: 0, endRowIndex, startColumnIndex: 0, endColumnIndex: 7 },
      rows: rows.map(row => ({ values: row.map(value => ({ userEnteredValue: typeof value === 'number' ? { numberValue: value } : { stringValue: String(value) } })) })),
      fields: 'userEnteredValue',
    } });
    return requests;
  });
}

// Pure contract functions below are also used by the local CLI preview and tests.
function buildMasterPublishSummary_(values) {
  const masterRows = parseMasterValues_(values);
  const validation = validateMasterRows_(masterRows);
  const publishRows = projectMasterRows_(masterRows);
  return {
    masterRowCount: masterRows.length,
    publishCounts: Object.fromEntries(Object.entries(publishRows).map(([category, rows]) => [category, rows.length])),
    publishRows,
    ...validation,
  };
}

function parseMasterValues_(values) {
  const [header = [], ...rows] = values;
  const headers = header.map(value => String(value).trim().toLowerCase());
  const invalid = MASTER_HEADERS.filter(name => headers.filter(value => value === name).length !== 1);
  if (invalid.length) throw new Error(`Master 必要表頭缺少或重複：${invalid.join(', ')}`);
  return rows.filter(row => row.some((value, index) => {
    const text = String(value == null ? '' : value).trim().toLowerCase();
    return text !== '' && !(MASTER_FLAGS.includes(headers[index]) && ['false', '0', 'no', 'n'].includes(text));
  }))
    .map((row, index) => {
      const get = name => row[headers.indexOf(name)];
      const record = {
        shop: normalizeText_(get('shop')) || '', maplink: normalizeText_(get('maplink')) || '',
        city: normalizeText_(get('city')), district: normalizeText_(get('district')),
        lat: parseOptionalNumber_(get('lat')), lng: parseOptionalNumber_(get('lng')), placeid: normalizeText_(get('placeid')),
      };
      MASTER_FLAGS.forEach(flag => { record[flag] = parseBoolean_(get(flag), `${record.shop || `資料列 ${index + 2}`} / ${flag}`); });
      return record;
    });
}

function validateMasterRows_(rows) {
  const blockingErrors = [];
  const warnings = [];
  const enabled = rows.filter(row => row.is_enabled);
  if (!enabled.length) blockingErrors.push({ shop: '(master)', field: 'row', message: '沒有啟用的資料，禁止整庫清空。' });
  enabled.forEach(row => {
    const shop = row.shop || '(empty shop)';
    ['shop', 'maplink'].forEach(field => {
      if (!row[field]) blockingErrors.push({ shop, field, message: `${field} is required` });
    });
    if (!MASTER_FLAGS.slice(0, 4).some(flag => row[flag])) {
      blockingErrors.push({ shop, field: 'row', message: '啟用的店家至少須選一種分類。' });
    }
    ['city', 'district', 'lat', 'lng', 'placeid'].forEach(field => {
      if (row[field] == null || row[field] === '') warnings.push({ shop, field, message: `${field} is missing` });
    });
  });
  return { blockingErrors, warnings };
}

function projectMasterRows_(rows) {
  const buckets = { lunch: [], dinner: [], drinks: [], sweets: [] };
  rows.filter(row => row.is_enabled).forEach(row => {
    const published = MASTER_SYNC_CONFIG.publishHeaders.map(field => row[field] == null ? '' : row[field]);
    Object.keys(buckets).forEach((category, index) => { if (row[MASTER_FLAGS[index]]) buckets[category].push(published); });
  });
  return Object.fromEntries(Object.entries(buckets).map(([category, records]) => [category, sortPublishRows_(records)]));
}

function sortPublishRows_(rows) {
  const sorted = rows.sort((a, b) => String(a[2]).localeCompare(String(b[2]), 'zh-Hant') || String(a[3]).localeCompare(String(b[3]), 'zh-Hant') || String(a[0]).localeCompare(String(b[0]), 'zh-Hant'));
  const firstComplete = sorted.findIndex(row => row.slice(2, 7).every(value => value !== ''));
  return firstComplete > 0 ? [sorted[firstComplete], ...sorted.slice(0, firstComplete), ...sorted.slice(firstComplete + 1)] : sorted;
}

function parseOptionalNumber_(value) {
  if (value == null || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean_(value, label) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value == null ? '' : value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  throw new Error(`${label} 必須是明確的 TRUE 或 FALSE，不能空白或拼錯。`);
}

function normalizeText_(value) {
  return String(value == null ? '' : value).trim() || null;
}
