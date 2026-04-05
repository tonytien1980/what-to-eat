import rawManifest from '../../../images/backgrounds/manifest.json';
import type {
  ActiveSceneSelection,
  CwaForecastPeriod,
  SceneKey,
  SceneVariantKey,
} from './types';

const backgroundModules = import.meta.glob('../../../images/backgrounds/**/*.webp', {
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
} as const;

function resolveBackgroundFile(relativePath: string) {
  return backgroundModules[`../../../images/backgrounds/${relativePath}`];
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

export function pickSceneForPeriod(period: CwaForecastPeriod): SceneKey {
  const variantKey = mapWxCodeToVariant(period.wxCode);

  if (
    variantKey === 'thunderstorm' ||
    variantKey === 'heavy_rain' ||
    variantKey === 'dense_fog' ||
    variantKey === 'freezing_fog' ||
    variantKey === 'snow'
  ) {
    return 'forest_ruins';
  }

  if (variantKey === 'rain') {
    return period.highTemp >= 27 ? 'desert_oasis' : 'forest_ruins';
  }

  if (variantKey === 'clear_cloudy' || variantKey === 'overcast') {
    return period.highTemp >= 28 ? 'desert_oasis' : 'floating_isles';
  }

  return 'forest_ruins';
}

export function getSceneAsset(
  sceneKey: SceneKey,
  variantKey: SceneVariantKey = 'default',
) {
  const scene = manifest.scenes[sceneKey];

  if (!scene) {
    return '';
  }

  if (variantKey !== 'default' && scene.variants[variantKey]) {
    return resolveBackgroundFile(scene.variants[variantKey]!.file);
  }

  return resolveBackgroundFile(scene.default);
}

export function resolveSceneSelection(period: CwaForecastPeriod): ActiveSceneSelection {
  const variantKey = mapWxCodeToVariant(period.wxCode);
  const sceneKey = pickSceneForPeriod(period);
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
    imageUrl: getSceneAsset(sceneKey, variantKey),
  };
}

export function getAltarSceneAsset() {
  return getSceneAsset('crystal_cavern', 'default');
}
