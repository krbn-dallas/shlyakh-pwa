import type { City, CityId } from '@/shared/model/types';

export const inBbox = (lat: number, lon: number, b: City['bbox']) =>
  lat >= b[0] && lat <= b[2] && lon >= b[1] && lon <= b[3];

/** Which known city contains this point? Prefers trip contexts over browse-only cities. */
export const cityByCoord = (lat: number, lon: number, cities: City[]): CityId | null => {
  const hits = cities.filter((c) => inBbox(lat, lon, c.bbox));
  if (!hits.length) return null;
  return (hits.find((c) => c.primary) ?? hits[0]).id;
};

export const getPosition = (timeout = 8000) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('no-geolocation'));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false,
    });
  });
