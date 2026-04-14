const MASTER_SYNC_CONFIG = {
  masterSpreadsheetId: '11Q8TfeTjvOuDwgX9Ux1kG91pahFcfjC1hA4VO0k4KdM',
  masterSheetName: 'restaurants_master',
  publishSpreadsheetId: '1bVR4JtMgJTsDs3qPgPDZexZeOP-0qLhhLolwqDYNt7k',
  publishTabs: {
    lunch: '午餐',
    dinner: '晚餐',
    drinks: '飲料',
    sweets: '甜點',
  },
  publishHeaders: ['shop', 'maplink', 'city', 'district', 'lat', 'lng', 'placeid'],
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Master Sync')
    .addItem('預覽同步摘要', 'previewMasterPublishSync')
    .addItem('發布到前端資料庫', 'publishMasterToRuntime')
    .addToUi();
}

function previewMasterPublishSync() {
  const summary = buildMasterPublishSummary_();
  const ui = SpreadsheetApp.getUi();

  if (summary.blockingErrors.length > 0) {
    ui.alert(
      'Master Sync 預覽失敗',
      [
        `blocking errors: ${summary.blockingErrors.length}`,
        ...summary.blockingErrors.slice(0, 10).map(
          (issue) => `- ${issue.shop} / ${issue.field}: ${issue.message}`,
        ),
      ].join('\n'),
      ui.ButtonSet.OK,
    );
    return;
  }

  ui.alert(
    'Master Sync 預覽完成',
    [
      `master rows: ${summary.masterRowCount}`,
      `午餐: ${summary.publishCounts.lunch}`,
      `晚餐: ${summary.publishCounts.dinner}`,
      `飲料: ${summary.publishCounts.drinks}`,
      `甜點: ${summary.publishCounts.sweets}`,
      `warnings: ${summary.warnings.length}`,
    ].join('\n'),
    ui.ButtonSet.OK,
  );
}

function publishMasterToRuntime() {
  const summary = buildMasterPublishSummary_();
  const ui = SpreadsheetApp.getUi();

  if (summary.blockingErrors.length > 0) {
    ui.alert(
      'Master Sync 發布失敗',
      [
        `blocking errors: ${summary.blockingErrors.length}`,
        ...summary.blockingErrors.slice(0, 10).map(
          (issue) => `- ${issue.shop} / ${issue.field}: ${issue.message}`,
        ),
      ].join('\n'),
      ui.ButtonSet.OK,
    );
    return;
  }

  const publishSpreadsheet = SpreadsheetApp.openById(
    MASTER_SYNC_CONFIG.publishSpreadsheetId,
  );

  for (const [category, tabName] of Object.entries(MASTER_SYNC_CONFIG.publishTabs)) {
    const sheet = publishSpreadsheet.getSheetByName(tabName);

    if (!sheet) {
      throw new Error(`Missing publish tab: ${tabName}`);
    }

    syncPublishSheet_(sheet, summary.publishRows[category]);
  }

  ui.alert(
    'Master Sync 發布完成',
    [
      `master rows: ${summary.masterRowCount}`,
      `午餐: ${summary.publishCounts.lunch}`,
      `晚餐: ${summary.publishCounts.dinner}`,
      `飲料: ${summary.publishCounts.drinks}`,
      `甜點: ${summary.publishCounts.sweets}`,
      `warnings: ${summary.warnings.length}`,
    ].join('\n'),
    ui.ButtonSet.OK,
  );
}

function buildMasterPublishSummary_() {
  const masterRows = loadMasterRows_();
  const validation = validateMasterRows_(masterRows);
  const publishRows = projectMasterRows_(masterRows);

  return {
    masterRowCount: masterRows.length,
    publishCounts: {
      lunch: publishRows.lunch.length,
      dinner: publishRows.dinner.length,
      drinks: publishRows.drinks.length,
      sweets: publishRows.sweets.length,
    },
    publishRows,
    blockingErrors: validation.blockingErrors,
    warnings: validation.warnings,
  };
}

function loadMasterRows_() {
  const spreadsheet = SpreadsheetApp.openById(
    MASTER_SYNC_CONFIG.masterSpreadsheetId,
  );
  const sheet = spreadsheet.getSheetByName(MASTER_SYNC_CONFIG.masterSheetName);

  if (!sheet) {
    throw new Error(`Missing master sheet: ${MASTER_SYNC_CONFIG.masterSheetName}`);
  }

  const values = sheet.getDataRange().getValues();
  const headerRow = values[0] || [];
  const rows = values.slice(1);
  const headers = headerRow.map((header) => String(header).trim().toLowerCase());
  const indexOf = (name) => headers.indexOf(name);
  const shopIndex = indexOf('shop');
  const maplinkIndex = indexOf('maplink');

  if (shopIndex === -1 || maplinkIndex === -1) {
    throw new Error('Master sheet header is missing shop/maplink');
  }

  return rows
    .filter((row) => row.some((value) => String(value).trim().length > 0))
    .map((row) => ({
      shop: String(row[shopIndex] || ''),
      maplink: String(row[maplinkIndex] || ''),
      city: normalizeText_(row[indexOf('city')]),
      district: normalizeText_(row[indexOf('district')]),
      lat: parseOptionalNumber_(row[indexOf('lat')]),
      lng: parseOptionalNumber_(row[indexOf('lng')]),
      placeid: normalizeText_(row[indexOf('placeid')]),
      is_lunch: parseBoolean_(row[indexOf('is_lunch')]),
      is_dinner: parseBoolean_(row[indexOf('is_dinner')]),
      is_drink: parseBoolean_(row[indexOf('is_drink')]),
      is_sweet: parseBoolean_(row[indexOf('is_sweet')]),
      is_enabled: parseBoolean_(row[indexOf('is_enabled')]),
    }));
}

function validateMasterRows_(masterRows) {
  const blockingErrors = [];
  const warnings = [];

  masterRows
    .filter((row) => row.is_enabled)
    .forEach((row) => {
      const safeShop = row.shop || '(empty shop)';

      if (!row.shop.trim()) {
        blockingErrors.push({
          shop: safeShop,
          field: 'shop',
          message: 'shop is required',
        });
      }

      if (!row.maplink.trim()) {
        blockingErrors.push({
          shop: safeShop,
          field: 'maplink',
          message: 'maplink is required',
        });
      }

      ['city', 'district', 'lat', 'lng', 'placeid'].forEach((field) => {
        const value = row[field];

        if (value == null || value === '') {
          warnings.push({
            shop: safeShop,
            field,
            message: `${field} is missing`,
          });
        }
      });
    });

  return {
    blockingErrors,
    warnings,
  };
}

function projectMasterRows_(masterRows) {
  const buckets = {
    lunch: [],
    dinner: [],
    drinks: [],
    sweets: [],
  };

  masterRows
    .filter((row) => row.is_enabled)
    .forEach((row) => {
      const publishRow = toPublishRow_(row);

      if (row.is_lunch) {
        buckets.lunch.push(publishRow);
      }

      if (row.is_dinner) {
        buckets.dinner.push(publishRow);
      }

      if (row.is_drink) {
        buckets.drinks.push(publishRow);
      }

      if (row.is_sweet) {
        buckets.sweets.push(publishRow);
      }
    });

  return {
    lunch: sortPublishRows_(buckets.lunch),
    dinner: sortPublishRows_(buckets.dinner),
    drinks: sortPublishRows_(buckets.drinks),
    sweets: sortPublishRows_(buckets.sweets),
  };
}

function syncPublishSheet_(sheet, rows) {
  sheet
    .getRange(1, 1, 1, MASTER_SYNC_CONFIG.publishHeaders.length)
    .setValues([MASTER_SYNC_CONFIG.publishHeaders]);

  if (sheet.getMaxRows() > 1) {
    sheet
      .getRange(2, 1, sheet.getMaxRows() - 1, MASTER_SYNC_CONFIG.publishHeaders.length)
      .clearContent();
  }

  if (rows.length > 0) {
    sheet
      .getRange(2, 1, rows.length, MASTER_SYNC_CONFIG.publishHeaders.length)
      .setValues(rows);
  }
}

function toPublishRow_(row) {
  return [
    row.shop,
    row.maplink,
    row.city || '',
    row.district || '',
    row.lat == null ? '' : row.lat,
    row.lng == null ? '' : row.lng,
    row.placeid || '',
  ];
}

function sortPublishRows_(rows) {
  const sorted = rows.sort((left, right) => {
    return (
      String(left[2]).localeCompare(String(right[2]), 'zh-Hant') ||
      String(left[3]).localeCompare(String(right[3]), 'zh-Hant') ||
      String(left[0]).localeCompare(String(right[0]), 'zh-Hant')
    );
  });

  const hasStableLeadingRow = (row) =>
    row[2] !== '' &&
    row[3] !== '' &&
    row[4] !== '' &&
    row[5] !== '' &&
    row[6] !== '';

  if (sorted.length <= 1 || hasStableLeadingRow(sorted[0])) {
    return sorted;
  }

  const firstStableIndex = sorted.findIndex((row) => hasStableLeadingRow(row));

  if (firstStableIndex <= 0) {
    return sorted;
  }

  return [
    sorted[firstStableIndex],
    ...sorted.slice(0, firstStableIndex),
    ...sorted.slice(firstStableIndex + 1),
  ];
}

function parseOptionalNumber_(value) {
  if (value === '' || value == null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean_(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  return ['true', '1', 'yes', 'y'].includes(normalized);
}

function normalizeText_(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}
