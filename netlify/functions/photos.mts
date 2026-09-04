import type { Config } from '@netlify/functions';
import { bad, json } from './_lib.mts';

/** Pexels proxy — illustrations for diary pages you have not photographed yet. */
export default async (req: Request) => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return bad('photos not configured', 503);

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? 'morocco').slice(0, 80);
  const per = Math.min(Number(url.searchParams.get('per') ?? 12), 24);

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per}&orientation=landscape`,
    { headers: { Authorization: key } },
  );
  if (!res.ok) return bad(`upstream ${res.status}`, 502);

  const j = await res.json() as {
    photos: { id: number; alt: string; photographer: string; url: string;
              src: { large: string; medium: string; tiny: string } }[];
  };

  return new Response(JSON.stringify({
    photos: (j.photos ?? []).map((p) => ({
      id: String(p.id),
      alt: p.alt,
      by: p.photographer,
      link: p.url,
      thumb: p.src.tiny,
      medium: p.src.medium,
      large: p.src.large,
    })),
  }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
  });
};

export const config: Config = { path: '/api/photos' };
