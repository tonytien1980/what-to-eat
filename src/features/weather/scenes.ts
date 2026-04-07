import rawManifest from '../../../images/backgrounds/shared-manifest.json';
import type {
  ActiveSceneSelection,
  CwaForecastPeriod,
  SceneKey,
  SceneVariantKey,
} from './types';

const backgroundModules = import.meta.glob('../../../images/backgrounds/shared/**/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

interface ManifestVariant {
  file: string;
  label_zh: string;
  cwa_wx_codes: number[];
}

interface ManifestScene {
  default: string;
  type: string;
  variants: Partial<Record<Exclude<SceneVariantKey, 'default'>, ManifestVariant>>;
}

interface SceneManifest {
  scenes: Record<SceneKey, ManifestScene>;
}

const manifest = rawManifest as SceneManifest;

const sceneLabelMap: Record<SceneKey, string> = {
  forest_ruins: '森林遺跡',
  floating_isles: '漂浮群島',
  desert_oasis: '沙漠綠洲',
  crystal_cavern: '水晶洞窟',
};

const timeLabelMap = {
  TD: '今天白天',
  TN: '今晚明晨',
  TM: '明天白天',
  TMN: '明天夜晚',
  '3hr': '中山區 3 小時天氣預報',
} as const;

function resolveBackgroundFile(relativePath: string) {
  return backgroundModules[`../../../images/backgrounds/shared/${relativePath}`];
}

function normalizeRandomValue(randomValue: number) {
  return Math.min(Math.max(randomValue, 0), 0.999999);
}

function sceneSupportsVariant(sceneKey: SceneKey, variantKey: SceneVariantKey) {
  const scene = manifest.scenes[sceneKey];

  if (!scene || scene.type === 'special_indoor') {
    return false;
  }

  if (variantKey === 'default') {
    return true;
  }

  return Boolean(scene.variants[variantKey]);
}

function getWeightedSceneCandidates(
  variantKey: SceneVariantKey,
  period: CwaForecastPeriod,
) {
  const candidates = (Object.keys(manifest.scenes) as SceneKey[]).filter((sceneKey) =>
    sceneSupportsVariant(sceneKey, variantKey),
  );

  if (candidates.length === 0) {
    return ['forest_ruins'] as SceneKey[];
  }

  const weighted = [...candidates];

  if (variantKey === 'thunderstorm') {
    weighted.unshift('forest_ruins');
  }

  if (variantKey === 'rain') {
    weighted.unshift('forest_ruins');

    if (period.highTemp >= 27 && candidates.includes('desert_oasis')) {
      weighted.unshift('desert_oasis');
    }
  }

  if (variantKey === 'clear_cloudy' || variantKey === 'overcast') {
    if (period.highTemp >= 28 && candidates.includes('desert_oasis')) {
      weighted.unshift('desert_oasis');
    }

    if (period.highTemp <= 26 && candidates.includes('floating_isles')) {
      weighted.unshift('floating_isles');
    }
  }

  return weighted;
}

export function mapWxCodeToVariant(wxCode: number): SceneVariantKey {
  const variants = manifest.scenes.forest_ruins.variants;

  for (const [variantKey, variantValue] of Object.entries(variants)) {
    if (variantValue?.cwa_wx_codes.includes(wxCode)) {
      return variantKey as SceneVariantKey;
    }
  }

  return 'default';
}

export function pickSceneForPeriod(
  period: CwaForecastPeriod,
  randomValue = 0,
): SceneKey {
  const variantKey = mapWxCodeToVariant(period.wxCode);
  const candidates = getWeightedSceneCandidates(variantKey, period);
  const selectedIndex = Math.floor(normalizeRandomValue(randomValue) * candidates.length);

  return candidates[selectedIndex] ?? 'forest_ruins';
}

export function getSceneAsset(
  sceneKey: SceneKey,
  variantKey: SceneVariantKey = 'default',
  randomValue = 0,
) {
  const scene = manifest.scenes[sceneKey];

  if (!scene) {
    return '';
  }

  const targetFile =
    variantKey !== 'default' && scene.variants[variantKey]
      ? scene.variants[variantKey]!.file
      : scene.default;

  const targetBaseName = targetFile.replace(/\.webp$/, '');
  const assetCandidates = Object.entries(backgroundModules)
    .filter(([modulePath]) =>
      new RegExp(
        `^\\.\\.\\/\\.\\.\\/\\.\\.\\/images/backgrounds/shared/${sceneKey}/${targetBaseName.split('/').pop()!}(?:[-_][^/]+)?\\.webp$`,
      ).test(modulePath),
    )
    .map(([, assetUrl]) => assetUrl)
    .sort();

  const resolvedCandidates =
    assetCandidates.length > 0
      ? assetCandidates
      : [resolveBackgroundFile(targetFile)].filter(Boolean);

  const selectedIndex = Math.floor(
    normalizeRandomValue(randomValue) * resolvedCandidates.length,
  );

  return resolvedCandidates[selectedIndex] ?? resolvedCandidates[0] ?? '';
}

export function resolveSceneSelection(
  period: CwaForecastPeriod,
  randomValue = 0,
): ActiveSceneSelection {
  const variantKey = mapWxCodeToVariant(period.wxCode);
  const sceneKey = pickSceneForPeriod(period, randomValue);
  const scene = manifest.scenes[sceneKey];
  const label =
    variantKey !== 'default' && scene.variants[variantKey]
      ? scene.variants[variantKey]!.label_zh
      : timeLabelMap[period.type];

  return {
    sceneKey,
    sceneLabel: sceneLabelMap[sceneKey],
    variantKey,
    variantLabel: label,
    imageUrl: getSceneAsset(sceneKey, variantKey, randomValue),
    assetPath: `shared/${
      variantKey !== 'default' && scene.variants[variantKey]
        ? scene.variants[variantKey]!.file
        : scene.default
    }`,
  };
}

export function getAltarSceneAsset() {
  return getSceneAsset('crystal_cavern', 'default');
}

export const resolveSharedSceneSelection = resolveSceneSelection;
