export interface Coordinates {
  lat: number;
  lng: number;
}

export function calculateDistanceMeters(origin: Coordinates, target: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(target.lat - origin.lat);
  const deltaLng = toRadians(target.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const targetLat = toRadians(target.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceLabel(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `遠征地距離你約 ${Math.round(distanceMeters)} 公尺`;
  }

  const kilometers = Number((distanceMeters / 1000).toFixed(1));
  return `遠征地距離你約 ${kilometers} 公里`;
}
