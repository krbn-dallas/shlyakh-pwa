import { estimateWalk, haversine } from './haversine';

export interface RouteResult {
  distance: number;                 // metres
  duration: number;                 // seconds
  geometry: [number, number][];     // [lat, lon] pairs, ready for Leaflet
  estimated: boolean;               // true when this is the offline fallback
}

/**
 * Walking route via the public FOSSGIS OSRM instance, with a straight-line
 * fallback so the map still gives a useful answer offline.
 */
export async function fetchRoute(coords: [number, number][]): Promise<RouteResult> {
  const fallback = (): RouteResult => {
    let straight = 0;
    for (let i = 1; i < coords.length; i++) {
      straight += haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
    }
    const est = estimateWalk(straight);
    return {
      distance: est.distance,
      duration: est.duration,
      geometry: coords.map(([lon, lat]) => [lat, lon] as [number, number]),
      estimated: true,
    };
  };

  if (coords.length < 2 || !navigator.onLine) return fallback();

  const path = coords.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${path}?overview=full&geometries=geojson`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return fallback();
    const json = (await res.json()) as {
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const r = json.routes?.[0];
    if (!r) return fallback();
    return {
      distance: r.distance,
      duration: r.duration,
      geometry: r.geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]),
      estimated: false,
    };
  } catch {
    return fallback();
  }
}
