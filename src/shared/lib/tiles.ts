/**
 * Warms the service worker's tile cache for a city bbox so the map still works
 * in the medina with no signal. Capped to stay inside the SW's 900-entry budget
 * and to stay polite to the OSM tile servers.
 */
const CACHE = 'osm-tiles';
const MAX_TILES = 700;
const CONCURRENCY = 6;

const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

export function tileUrls(bbox: [number, number, number, number], zooms = [13, 14, 15, 16]): string[] {
  const [latS, lonW, latN, lonE] = bbox;
  const urls: string[] = [];
  for (const z of zooms) {
    const x0 = lon2x(lonW, z), x1 = lon2x(lonE, z);
    const y0 = lat2y(latN, z), y1 = lat2y(latS, z);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        urls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
        if (urls.length >= MAX_TILES) return urls;
      }
    }
  }
  return urls;
}

export async function prefetchTiles(
  bbox: [number, number, number, number],
  onProgress: (pct: number) => void,
): Promise<number> {
  if (!('caches' in window)) throw new Error('no-cache-api');
  const cache = await caches.open(CACHE);
  const urls = tileUrls(bbox);
  let done = 0;

  const worker = async (queue: string[]) => {
    for (const url of queue) {
      try {
        if (!(await cache.match(url))) {
          const res = await fetch(url, { mode: 'cors' });
          if (res.ok) await cache.put(url, res.clone());
        }
      } catch { /* one missing tile is not worth failing the whole run */ }
      done++;
      onProgress(Math.round((done / urls.length) * 100));
    }
  };

  const lanes: string[][] = Array.from({ length: CONCURRENCY }, () => []);
  urls.forEach((u, i) => lanes[i % CONCURRENCY].push(u));
  await Promise.all(lanes.map(worker));
  return urls.length;
}
