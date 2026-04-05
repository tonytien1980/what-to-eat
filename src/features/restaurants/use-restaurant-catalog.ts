import { useEffect, useState } from 'react';
import { restaurants as fallbackRestaurants, restaurantSheetSources } from './data';
import { resolveRestaurantCatalog } from './google-sheet-loader';
import type { RestaurantCatalogResult } from './types';

const loadingCatalog: RestaurantCatalogResult = {
  restaurants: fallbackRestaurants,
  sourceLabel: 'Google Sheet 同步中',
  status: 'loading',
};

export function useRestaurantCatalog() {
  const [catalog, setCatalog] = useState<RestaurantCatalogResult>(loadingCatalog);

  useEffect(() => {
    let isActive = true;

    if (import.meta.env.MODE === 'test') {
      setCatalog({
        restaurants: fallbackRestaurants,
        sourceLabel: '本地快照備援',
        status: 'fallback',
      });
      return () => {
        isActive = false;
      };
    }

    resolveRestaurantCatalog({
      fallbackRestaurants,
      sources: restaurantSheetSources,
    }).then((result) => {
      if (isActive) {
        setCatalog(result);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return catalog;
}
