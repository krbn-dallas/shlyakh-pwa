import type { POI, POICat, CityId } from '@/shared/model/types';

/**
 * Overpass (OpenStreetMap) — free, no key. Used for live "what's near me"
 * discovery on top of the curated offline catalogue. Online only by nature;
 * results are cached by the service worker for a week.
 */
const ENDPOINT = 'https://overpass-api.de/api/interpreter';

const QUERY: Partial<Record<POICat, string>> = {
  food: '["amenity"~"^(restaurant|cafe|fast_food)$"]',
  market: '["amenity"="marketplace"],["shop"~"^(greengrocer|supermarket)$"]',
  shop: '["shop"~"^(mall|department_store|clothes|gift|craft)$"]',
  pharmacy: '["amenity"="pharmacy"]',
  exchange: '["amenity"~"^(bureau_de_change|bank)$"]',
  money: '["amenity"="atm"]',
};

export async function findNearby(
  lat: number, lon: number, cat: POICat, city: CityId, radiusM = 1200, signal?: AbortSignal,
): Promise<POI[]> {
  const filters = QUERY[cat];
  if (!filters) return [];

  const parts = filters.split('],[').map((f, i, a) => {
    const clean = (i === 0 ? f : `[${f}`) + (i === a.length - 1 ? '' : ']');
    return `nwr${clean}(around:${radiusM},${lat},${lon});`;
  }).join('');

  const body = `[out:json][timeout:20];(${parts});out center ${40};`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(body)}`,
    signal,
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);

  const j = await res.json() as {
    elements: {
      id: number; type: string; lat?: number; lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }[];
  };

  return j.elements
    .map((e): POI | null => {
      const la = e.lat ?? e.center?.lat;
      const lo = e.lon ?? e.center?.lon;
      const name = e.tags?.['name:uk'] || e.tags?.name || e.tags?.['name:en'];
      if (la === undefined || lo === undefined || !name) return null;
      const en = e.tags?.['name:en'] || name;
      const kind = e.tags?.amenity || e.tags?.shop || '';
      return {
        id: `osm-${e.type}-${e.id}`,
        city,
        cat,
        name: { uk: name, en },
        lat: la,
        lon: lo,
        hours: e.tags?.opening_hours,
        tel: e.tags?.['contact:phone'] || e.tags?.phone,
        address: [e.tags?.['addr:street'], e.tags?.['addr:housenumber']].filter(Boolean).join(' ') || undefined,
        tags: kind ? [kind] : undefined,
      };
    })
    .filter((p): p is POI => p !== null);
}
