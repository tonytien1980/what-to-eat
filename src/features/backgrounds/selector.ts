import rawManifest from '../../../images/backgrounds/district-manifest.json';
import type { LocationPreference } from '../location/types';
import { resolveSharedSceneSelection } from '../weather/scenes';
import { mapWxCodeToVariant } from '../weather/scenes';
import type { CwaForecastPeriod, SceneVariantKey } from '../weather/types';

const backgroundModules = import.meta.glob('../../../images/backgrounds/**/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

interface VariantMetadata {
  label_zh: string;
}

interface LandmarkVariantMap extends Partial<Record<SceneVariantKey, string>> {}

interface LandmarkEntry {
  label_zh: string;
  weight?: number;
  variants: LandmarkVariantMap;
}

interface WeatherPoolEntry {
  landmark: string;
  weight?: number;
}

interface DistrictEntry {
  slug: string;
  landmarks: Record<string, LandmarkEntry>;
  weather_pools?: Partial<Record<SceneVariantKey, readonly WeatherPoolEntry[]>>;
}

interface CityEntry {
  slug: string;
  districts: Record<string, DistrictEntry>;
}

interface DistrictBackgroundManifest {
  version: number;
  variants: Partial<Record<SceneVariantKey, VariantMetadata>>;
  cities: Record<string, CityEntry>;
}

export interface RuntimeBackgroundSelection {
  source: 'district' | 'shared';
  sceneLabel: string;
  variantKey: SceneVariantKey;
  variantLabel: string;
  imageUrl: string;
  assetPath: string;
  citySlug?: string;
  districtSlug?: string;
  landmarkSlug?: string;
}

const manifest = rawManifest as DistrictBackgroundManifest;

function normalizeRandomValue(randomValue: number) {
  return Math.min(Math.max(randomValue, 0), 0.999999);
}

function resolveBackgroundAsset(
  assetPath: string,
  assetModules: Record<string, string> = backgroundModules,
) {
  return assetModules[`../../../images/backgrounds/${assetPath}`] ?? '';
}

function getVariantLabel(
  sourceManifest: DistrictBackgroundManifest,
  variantKey: SceneVariantKey,
) {
  return sourceManifest.variants[variantKey]?.label_zh ?? '預設場景';
}

function pickWeightedPoolEntry(
  entries: readonly WeatherPoolEntry[],
  randomValue: number,
) {
  if (entries.length === 0) {
    return null;
  }

  const totalWeight = entries.reduce((sum, entry) => sum + (entry.weight ?? 1), 0);
  const target = normalizeRandomValue(randomValue) * totalWeight;
  let cursor = 0;

  for (const entry of entries) {
    cursor += entry.weight ?? 1;

    if (target < cursor) {
      return entry;
    }
  }

  return entries[entries.length - 1] ?? null;
}

function getDistrictPoolCandidates(
  districtEntry: DistrictEntry,
  variantKey: SceneVariantKey,
) {
  const configuredPool = districtEntry.weather_pools?.[variantKey] ?? [];
  const availableConfiguredPool = configuredPool.filter((entry) =>
    Boolean(districtEntry.landmarks[entry.landmark]?.variants[variantKey]),
  );

  if (availableConfiguredPool.length > 0) {
    return availableConfiguredPool;
  }

  return Object.entries(districtEntry.landmarks)
    .filter(([, landmarkEntry]) => Boolean(landmarkEntry.variants[variantKey]))
    .map(([landmarkSlug, landmarkEntry]) => ({
      landmark: landmarkSlug,
      weight: landmarkEntry.weight ?? 1,
    }));
}

export function resolveDistrictBackgroundSelectionFromManifest({
  manifest: sourceManifest,
  assetModules = backgroundModules,
  location,
  variantKey,
  randomValue = 0,
}: {
  manifest: DistrictBackgroundManifest;
  assetModules?: Record<string, string>;
  location: Pick<LocationPreference, 'city' | 'district'> | null;
  variantKey: SceneVariantKey;
  randomValue?: number;
}): RuntimeBackgroundSelection | null {
  if (!location?.city || !location.district) {
    return null;
  }

  const cityEntry = sourceManifest.cities[location.city];
  const districtEntry = cityEntry?.districts[location.district];

  if (!cityEntry || !districtEntry) {
    return null;
  }

  const candidates = getDistrictPoolCandidates(districtEntry, variantKey);
  const selectedPoolEntry = pickWeightedPoolEntry(candidates, randomValue);

  if (!selectedPoolEntry) {
    return null;
  }

  const landmarkEntry = districtEntry.landmarks[selectedPoolEntry.landmark];
  const assetPath = landmarkEntry?.variants[variantKey];

  if (!landmarkEntry || !assetPath) {
    return null;
  }

  const imageUrl = resolveBackgroundAsset(assetPath, assetModules);

  if (!imageUrl) {
    return null;
  }

  return {
    source: 'district',
    sceneLabel: landmarkEntry.label_zh,
    variantKey,
    variantLabel: getVariantLabel(sourceManifest, variantKey),
    imageUrl,
    assetPath,
    citySlug: cityEntry.slug,
    districtSlug: districtEntry.slug,
    landmarkSlug: selectedPoolEntry.landmark,
  };
}

export function resolveBackgroundSelection({
  location,
  period,
  randomValue = 0,
}: {
  location: Pick<LocationPreference, 'city' | 'district'> | null;
  period: CwaForecastPeriod;
  randomValue?: number;
}): RuntimeBackgroundSelection {
  const variantKey = mapWxCodeToVariant(period.wxCode);
  const districtSelection = resolveDistrictBackgroundSelectionFromManifest({
    manifest,
    location,
    variantKey,
    randomValue,
  });

  if (districtSelection) {
    return districtSelection;
  }

  const sharedSelection = resolveSharedSceneSelection(period, randomValue);

  return {
    source: 'shared',
    sceneLabel: sharedSelection.sceneLabel,
    variantKey: sharedSelection.variantKey,
    variantLabel: sharedSelection.variantLabel,
    imageUrl: sharedSelection.imageUrl,
    assetPath: sharedSelection.assetPath ?? '',
  };
}
