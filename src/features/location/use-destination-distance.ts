import { useMemo, useState } from 'react';
import type { RestaurantRecord } from '../restaurants/types';
import {
  calculateDistanceMeters,
  formatDistanceLabel,
  type Coordinates,
} from './distance';
import {
  readSavedDistancePreference,
  saveDistancePreference,
} from './distance-storage';

type DistanceStatus =
  | 'hidden'
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'unsupported'
  | 'unavailable';

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

function toCoordinates(destination: RestaurantRecord | null): Coordinates | null {
  if (
    !destination ||
    typeof destination.lat !== 'number' ||
    typeof destination.lng !== 'number'
  ) {
    return null;
  }

  return {
    lat: destination.lat,
    lng: destination.lng,
  };
}

export function useDestinationDistance(destination: RestaurantRecord | null) {
  const [savedPreference, setSavedPreference] = useState(() =>
    readSavedDistancePreference(),
  );
  const [requestState, setRequestState] = useState<Exclude<DistanceStatus, 'hidden' | 'ready'>>(
    savedPreference.permission === 'denied' ? 'unavailable' : 'idle',
  );
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(
    savedPreference.coordinates,
  );

  const destinationCoordinates = useMemo(
    () => toCoordinates(destination),
    [destination],
  );
  const distanceMeters = useMemo(() => {
    if (!destinationCoordinates || !userCoordinates) {
      return null;
    }

    return calculateDistanceMeters(userCoordinates, destinationCoordinates);
  }, [destinationCoordinates, userCoordinates]);

  const status: DistanceStatus = !destinationCoordinates
    ? 'hidden'
    : distanceMeters !== null
      ? 'ready'
      : requestState;

  function requestDistance() {
    if (!destinationCoordinates) {
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !('geolocation' in navigator) ||
      !navigator.geolocation
    ) {
      setRequestState('unsupported');
      return;
    }

    setRequestState('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nextPreference = {
          permission: 'accepted' as const,
          coordinates,
          savedAt: new Date().toISOString(),
        };

        setUserCoordinates(coordinates);
        setSavedPreference(nextPreference);
        saveDistancePreference(nextPreference);
        setRequestState('idle');
      },
      (error) => {
        if (error.code === 1) {
          const nextPreference = {
            permission: 'denied' as const,
            coordinates: userCoordinates,
            savedAt: savedPreference.savedAt,
          };

          setSavedPreference(nextPreference);
          saveDistancePreference(nextPreference);
          setRequestState('unavailable');
          return;
        }

        setRequestState('unavailable');
      },
      GEOLOCATION_OPTIONS,
    );
  }

  const label =
    status === 'ready' && distanceMeters !== null
      ? formatDistanceLabel(distanceMeters)
      : status === 'requesting'
        ? '正在確認你的位置...'
        : status === 'unsupported'
          ? '這台裝置暫不支援定位'
          : savedPreference.permission === 'denied'
            ? '請先在瀏覽器允許定位，才能顯示遠征地距離'
            : status === 'unavailable'
              ? '暫時無法確認你的位置，請再試一次'
            : '啟用定位後可顯示遠征地距離';

  return {
    status,
    label,
    requestDistance,
  };
}
