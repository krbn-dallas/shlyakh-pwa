const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Metres between two points. */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Offline fallback: streets are never straight — 1.35× at 4.5 km/h. */
export const estimateWalk = (straightM: number) => ({
  distance: straightM * 1.35,
  duration: (straightM * 1.35) / (4500 / 3600),
  estimated: true as const,
});

export const fmtDistance = (m: number): string =>
  m < 1000 ? `${Math.round(m / 10) * 10} м` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} км`;

export const fmtDuration = (s: number): string => {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  return `${h} год ${min % 60 ? `${min % 60} хв` : ''}`.trim();
};
