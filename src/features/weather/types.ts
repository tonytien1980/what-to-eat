export type SceneKey =
  | 'forest_ruins'
  | 'floating_isles'
  | 'desert_oasis'
  | 'crystal_cavern';

export type SceneVariantKey =
  | 'default'
  | 'clear_cloudy'
  | 'overcast'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'dense_fog'
  | 'freezing_fog'
  | 'snow';

export interface CwaForecastPeriod {
  timeRange: string;
  type: 'TD' | 'TN' | 'TM' | 'TMN';
  lowTemp: number;
  highTemp: number;
  pop: number;
  wxCode: number;
  weatherText: string;
  comfort: string;
}

export interface ActiveSceneSelection {
  sceneKey: SceneKey;
  sceneLabel: string;
  variantKey: SceneVariantKey;
  variantLabel: string;
  imageUrl: string;
}

export interface TaipeiWeatherSnapshot {
  cityName: '臺北市';
  issuedTime: string;
  sourceLabel: string;
  currentPeriod: CwaForecastPeriod;
  upcomingPeriods: CwaForecastPeriod[];
  activeScene: ActiveSceneSelection;
  forecastScenes: ActiveSceneSelection[];
}
