import type { Config } from '@netlify/functions';
import { bad, body, json, space, sql } from './_lib.mts';

/**
 * Last-write-wins sync for the diary. The phone is the source of truth while
 * offline; this endpoint merges by `updated_at` so two devices in one space
 * converge without a conflict UI.
 */
interface Entry {
  id: string; day: string; city?: string | null; mood?: number | null;
  weather_code?: number | null; temp_c?: number | null;
  morning_plan?: string | null; evening_note?: string | null;
  prompts?: unknown; answers?: unknown;
  lat?: number | null; lon?: number | null;
  updated_at: string; deleted?: boolean;
}
interface Media {
  id: string; entry_id: string; kind: string; url: string; public_id?: string | null;
  caption?: string | null; lat?: number | null; lon?: number | null;
  taken_at?: string | null; rotation?: number; updated_at: string; deleted?: boolean;
}

export default async (req: Request) => {
  const s = space(req);
  if (!s) return bad('bad space');

  if (req.method === 'GET') {
    const since = new URL(req.url).searchParams.get('since') ?? '1970-01-01';
    const entries = await sql`
      SELECT * FROM diary_entry WHERE space = ${s} AND updated_at > ${since}
      ORDER BY day`;
    const media = await sql`
      SELECT * FROM diary_media WHERE space = ${s} AND updated_at > ${since}`;
    return json({ entries, media, now: new Date().toISOString() });
  }

  if (req.method !== 'POST') return bad('GET or POST', 405);

  const payload = await body<{ entries?: Entry[]; media?: Media[] }>(req);
  if (!payload) return bad('bad json');

  for (const e of payload.entries ?? []) {
    await sql`
      INSERT INTO diary_entry
        (id, space, day, city, mood, weather_code, temp_c, morning_plan, evening_note,
         prompts, answers, lat, lon, updated_at, deleted)
      VALUES
        (${e.id}, ${s}, ${e.day}, ${e.city ?? null}, ${e.mood ?? null},
         ${e.weather_code ?? null}, ${e.temp_c ?? null}, ${e.morning_plan ?? null},
         ${e.evening_note ?? null}, ${JSON.stringify(e.prompts ?? [])},
         ${JSON.stringify(e.answers ?? {})}, ${e.lat ?? null}, ${e.lon ?? null},
         ${e.updated_at}, ${e.deleted ?? false})
      ON CONFLICT (id) DO UPDATE SET
        day = EXCLUDED.day, city = EXCLUDED.city, mood = EXCLUDED.mood,
        weather_code = EXCLUDED.weather_code, temp_c = EXCLUDED.temp_c,
        morning_plan = EXCLUDED.morning_plan, evening_note = EXCLUDED.evening_note,
        prompts = EXCLUDED.prompts, answers = EXCLUDED.answers,
        lat = EXCLUDED.lat, lon = EXCLUDED.lon,
        updated_at = EXCLUDED.updated_at, deleted = EXCLUDED.deleted
      WHERE diary_entry.updated_at < EXCLUDED.updated_at`;
  }

  for (const m of payload.media ?? []) {
    await sql`
      INSERT INTO diary_media
        (id, space, entry_id, kind, url, public_id, caption, lat, lon, taken_at,
         rotation, updated_at, deleted)
      VALUES
        (${m.id}, ${s}, ${m.entry_id}, ${m.kind}, ${m.url}, ${m.public_id ?? null},
         ${m.caption ?? null}, ${m.lat ?? null}, ${m.lon ?? null}, ${m.taken_at ?? null},
         ${m.rotation ?? 0}, ${m.updated_at}, ${m.deleted ?? false})
      ON CONFLICT (id) DO UPDATE SET
        caption = EXCLUDED.caption, rotation = EXCLUDED.rotation,
        updated_at = EXCLUDED.updated_at, deleted = EXCLUDED.deleted
      WHERE diary_media.updated_at < EXCLUDED.updated_at`;
  }

  return json({ ok: true, now: new Date().toISOString() });
};

export const config: Config = { path: '/api/diary' };
