export type Category = 'lunch' | 'dinner' | 'drinks' | 'sweets';

export type PriceLevel = 'low' | 'medium' | 'high';
export type DistanceLevel = 'near' | 'mid' | 'far';

export interface RestaurantRecord {
  id: string;
  name: string;
  category: Category;
  mapUrl: string;
  lat?: number | null;
  lng?: number | null;
  tags: string[];
  priceLevel: PriceLevel;
  distanceLevel: DistanceLevel;
  city: string | null;
  district: string | null;
  isEnabled: boolean;
}

export interface RestaurantSheetSource {
  category: Category;
  url: string;
}

export interface RestaurantCatalogResult {
  restaurants: RestaurantRecord[];
  sourceLabel: string;
  status: 'loading' | 'live' | 'fallback';
}
