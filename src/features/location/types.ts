export type LocationSource = 'default' | 'manual';
export type LocationPromptState = 'accepted';

export interface LocationPreference {
  city: string;
  district: string | null;
  source: LocationSource;
  promptState: LocationPromptState;
  savedAt: string | null;
}

export interface LocationOptionGroup {
  city: string;
  districts: string[];
}
