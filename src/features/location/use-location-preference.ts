import { useEffect, useMemo, useState } from 'react';
import type { RestaurantRecord } from '../restaurants/types';
import {
  buildLocationOptionGroups,
  ensureValidLocationPreference,
  formatLocationLabel,
  getDistrictOptions,
} from './options';
import {
  createDefaultLocationPreference,
  readSavedLocationPreference,
  saveLocationPreference,
} from './storage';

export function useLocationPreference(restaurants: RestaurantRecord[]) {
  const [currentLocation, setCurrentLocation] = useState(() =>
    readSavedLocationPreference() ?? createDefaultLocationPreference(),
  );
  const locationGroups = useMemo(
    () => buildLocationOptionGroups(restaurants, [currentLocation]),
    [currentLocation, restaurants],
  );
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [draftCity, setDraftCity] = useState(currentLocation.city);
  const [draftDistrict, setDraftDistrict] = useState(currentLocation.district);

  useEffect(() => {
    setCurrentLocation((previous) =>
      ensureValidLocationPreference(previous, locationGroups),
    );
  }, [locationGroups]);

  useEffect(() => {
    if (!isChooserOpen) {
      return;
    }

    setDraftCity(currentLocation.city);
    setDraftDistrict(currentLocation.district);
  }, [currentLocation, isChooserOpen]);

  const districtOptions = useMemo(
    () => getDistrictOptions(locationGroups, draftCity),
    [locationGroups, draftCity],
  );

  function openChooser() {
    setIsChooserOpen(true);
  }

  function closeChooser() {
    setIsChooserOpen(false);
  }

  function updateDraftCity(nextCity: string) {
    setDraftCity(nextCity);

    const nextDistrictOptions = getDistrictOptions(locationGroups, nextCity);

    setDraftDistrict((previous) =>
      previous && nextDistrictOptions.includes(previous)
        ? previous
        : (nextDistrictOptions[0] ?? null),
    );
  }

  function updateDraftDistrict(nextDistrict: string) {
    setDraftDistrict(nextDistrict || null);
  }

  function skipDistrict() {
    setDraftDistrict(null);
  }

  function saveDraft() {
    const nextLocation = ensureValidLocationPreference(
      {
        city: draftCity,
        district: draftDistrict,
        source: 'manual',
        promptState: 'accepted',
        savedAt: new Date().toISOString(),
      },
      locationGroups,
    );

    saveLocationPreference(nextLocation);
    setCurrentLocation(nextLocation);
    closeChooser();
  }

  return {
    currentLocation,
    currentLocationLabel: formatLocationLabel(currentLocation),
    isChooserOpen,
    locationGroups,
    draftCity,
    draftDistrict,
    districtOptions,
    openChooser,
    closeChooser,
    updateDraftCity,
    updateDraftDistrict,
    skipDistrict,
    saveDraft,
    locationTriggerLabel: '更改預計冒險地',
  };
}
