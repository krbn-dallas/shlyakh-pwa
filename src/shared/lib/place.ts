import type { CityId, City, Lang } from '@/shared/model/types';
import { cityByCoord } from './geo';

/**
 * Where you actually are — not which of three curated cities we decided to
 * pretend you are in.
 *
 * The bbox list only covers the ten places we ship content for. Land anywhere
 * else in Morocco (or anywhere at all) and this still names the city, by
 * reverse-geocoding the real position. The curated `cityId` is kept separate:
 * it drives which SOS numbers and taxi data to show, and is only set when the
 * position genuinely falls inside one of those cities.
 */
export interface Place {
  lat: number;
  lon: number;
  /** Human name of wherever you are, e.g. "Ouarzazate", "Касабланка". */
  name: string;
  countryCode?: string;
  /** Set only when the point is inside a city we carry content for. */
  cityId: CityId | null;
  source: 'gps' | 'cache';
}

const CACHE_KEY = 'shlyakh.place';
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export function cachedPlace(): Place | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, place } = JSON.parse(raw) as { at: number; place: Place };
    if (Date.now() - at > MAX_AGE_MS) return null;
    return { ...place, source: 'cache' };
  } catch {
    return null;
  }
}

/**
 * Nominatim returns every script a place is signed in, e.g.
 * "Chefchaouen ⴰⵛⵛⴰⵡⵏ شفشاون". Keep the first one and drop the rest.
 */
function cleanName(raw: string): string {
  const cut = raw.search(/[\u0600-\u06FF\u2D30-\u2D7F\u0590-\u05FF]/);
  const first = (cut > 0 ? raw.slice(0, cut) : raw).trim();
  return first.replace(/[\s/|,-]+$/, '') || raw.trim();
}

const remember = (place: Place) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), place })); }
  catch { /* private mode — the value is a nicety, not a requirement */ }
};

/**
 * Reverse geocoding via Nominatim. `zoom=10` gives the city rather than the
 * street, which is what a header chip wants. Offline this simply fails and the
 * caller keeps the cached name.
 */
export async function resolvePlace(
  lat: number, lon: number, cities: City[], lang: Lang, signal?: AbortSignal,
): Promise<Place> {
  const cityId = cityByCoord(lat, lon, cities);
  const known = cityId ? cities.find((c) => c.id === cityId) : undefined;

  // A city we carry content for already has a proper localized name.
  let name = known ? (known.name[lang] || known.name.uk) : '';
  let countryCode = known?.country === 'ua' ? 'ua' : known?.country === 'md' ? 'md' : known ? 'ma' : undefined;

  if (!name && navigator.onLine) {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('lat', lat.toFixed(4));
      url.searchParams.set('lon', lon.toFixed(4));
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('zoom', '10');
      url.searchParams.set('accept-language', lang === 'en' ? 'en' : 'uk');
      const res = await fetch(url, { signal });
      if (res.ok) {
        const j = await res.json() as { address?: Record<string, string> };
        const a = j.address ?? {};
        name = cleanName(a.city || a.town || a.village || a.county || a.state || '');
        countryCode = a.country_code;
      }
    } catch { /* offline or rate-limited — fall through to the coordinates */ }
  }

  const place: Place = {
    lat, lon,
    name: name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    countryCode,
    cityId,
    source: 'gps',
  };
  remember(place);
  return place;
}
