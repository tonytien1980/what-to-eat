import { writeFile } from 'node:fs/promises';

const sourceSheets = [
  {
    category: 'lunch',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTL40EHlvYd4fJTVAbp7Hbf8aKb81T24y5zZDKp3z8Yok0GcNgEz06nduGlDE-pB8boYt2LOvdbSXfF/pub?gid=0&single=true&output=csv',
  },
  {
    category: 'dinner',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTL40EHlvYd4fJTVAbp7Hbf8aKb81T24y5zZDKp3z8Yok0GcNgEz06nduGlDE-pB8boYt2LOvdbSXfF/pub?gid=1781385445&single=true&output=csv',
  },
  {
    category: 'drinks',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTL40EHlvYd4fJTVAbp7Hbf8aKb81T24y5zZDKp3z8Yok0GcNgEz06nduGlDE-pB8boYt2LOvdbSXfF/pub?gid=1971131852&single=true&output=csv',
  },
  {
    category: 'sweets',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTL40EHlvYd4fJTVAbp7Hbf8aKb81T24y5zZDKp3z8Yok0GcNgEz06nduGlDE-pB8boYt2LOvdbSXfF/pub?gid=1512236499&single=true&output=csv',
  },
];

function parseCsv(text) {
  const rows = text.split(/\r?\n/).filter(Boolean);
  return rows.slice(1).map((row) => {
    const firstComma = row.indexOf(',');
    return {
      name: row.slice(0, firstComma).trim(),
      mapUrl: row.slice(firstComma + 1).trim(),
    };
  });
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[\s/・‧\.＿_]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

function hash(input) {
  let value = 0;

  for (const char of input) {
    value = (value * 31 + char.codePointAt(0)) % 2147483647;
  }

  return value;
}

function inferPriceLevel(name, category) {
  if (category === 'drinks' || category === 'sweets') {
    return 'low';
  }

  if (/(麻辣|鍋|義大利麵|pasta|和風|餐酒)/i.test(name)) {
    return 'high';
  }

  if (/(便當|擔仔麵|水餃|麵食|麵|飯|小吃)/i.test(name)) {
    return 'low';
  }

  return 'medium';
}

function inferDistanceLevel(name) {
  const levels = ['near', 'mid', 'far'];
  return levels[hash(name) % levels.length];
}

function inferTags(name, category) {
  const tags = new Set([category]);

  if (category === 'lunch' || category === 'dinner') {
    tags.add('meal');
    tags.add('hot');
  }

  if (category === 'drinks') {
    tags.add('drink');
    tags.add('tea');
    tags.add('cold');
  }

  if (category === 'sweets') {
    tags.add('dessert');
    tags.add('sweet');
  }

  const keywordMap = [
    [/飯|便當/u, 'rice'],
    [/麵|義大利麵|pasta/i, 'noodle'],
    [/水餃/u, 'dumpling'],
    [/茶|紅茶|奶茶/u, 'tea'],
    [/冰|冰沙/u, 'cold'],
    [/湯圓|熱/u, 'hot'],
    [/蛋糕|麻糬/u, 'snack'],
    [/甜/u, 'sweet'],
    [/辣|麻辣/u, 'spicy'],
    [/炸/u, 'fried'],
  ];

  for (const [pattern, tag] of keywordMap) {
    if (pattern.test(name)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

async function loadSourceSheet(category, url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${category}: ${response.status}`);
  }

  const text = await response.text();
  const rows = parseCsv(text);

  return rows.map((row, index) => ({
    id: `${category}-${slugify(row.name) || `entry-${index + 1}`}`,
    name: row.name,
    category,
    mapUrl: row.mapUrl,
    tags: inferTags(row.name, category),
    priceLevel: inferPriceLevel(row.name, category),
    distanceLevel: inferDistanceLevel(`${category}-${row.name}`),
    isEnabled: true,
  }));
}

async function main() {
  const imports = await Promise.all(
    sourceSheets.map((sheet) => loadSourceSheet(sheet.category, sheet.url)),
  );
  const records = imports.flat();

  await writeFile(
    new URL('../data/restaurants.json', import.meta.url),
    `${JSON.stringify(records, null, 2)}\n`,
    'utf8',
  );

  const summary = imports
    .map((items, index) => `${sourceSheets[index].category}: ${items.length}`)
    .join(', ');

  console.log(`Imported ${records.length} restaurants (${summary})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
