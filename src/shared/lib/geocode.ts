export interface GeoHit { name: string; lat: number; lon: number; }

/**
 * Nominatim forward geocoding. Online only — callers must handle the null
 * and let the user save an address without a pin.
 */
export async function geocode(query: string, signal?: AbortSignal): Promise<GeoHit[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '0');
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`geocode ${res.status}`);
  const json = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  return json.map((h) => ({ name: h.display_name, lat: Number(h.lat), lon: Number(h.lon) }));
}
