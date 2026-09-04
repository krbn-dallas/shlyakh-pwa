import type { Config } from '@netlify/functions';
import { bad, body, json, space, sql } from './_lib.mts';

interface Sub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  tz?: string;
  lang?: string;
  city?: string;
  departure?: string | null;
  ret?: string | null;
  morningHour?: number;
  eveningHour?: number;
}

/** Stores (or removes) a browser push subscription for a diary space. */
export default async (req: Request) => {
  const s = space(req);
  if (!s) return bad('bad space');

  if (req.method === 'DELETE') {
    const { endpoint } = (await body<{ endpoint: string }>(req)) ?? {};
    if (!endpoint) return bad('endpoint required');
    await sql`DELETE FROM push_sub WHERE endpoint = ${endpoint}`;
    return json({ ok: true });
  }

  if (req.method !== 'POST') return bad('POST or DELETE', 405);

  const sub = await body<Sub>(req);
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return bad('bad subscription');

  const clamp = (n: number | undefined, d: number) =>
    Number.isFinite(n) ? Math.min(23, Math.max(0, Math.floor(n as number))) : d;

  await sql`
    INSERT INTO push_sub
      (endpoint, space, p256dh, auth, tz, lang, city, departure, ret, morning_hour, evening_hour, failures)
    VALUES
      (${sub.endpoint}, ${s}, ${sub.keys.p256dh}, ${sub.keys.auth}, ${sub.tz ?? 'Europe/Kyiv'},
       ${sub.lang ?? 'uk'}, ${sub.city ?? null}, ${sub.departure ?? null}, ${sub.ret ?? null},
       ${clamp(sub.morningHour, 8)}, ${clamp(sub.eveningHour, 21)}, 0)
    ON CONFLICT (endpoint) DO UPDATE SET
      space = EXCLUDED.space, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
      tz = EXCLUDED.tz, lang = EXCLUDED.lang, city = EXCLUDED.city,
      departure = EXCLUDED.departure, ret = EXCLUDED.ret,
      morning_hour = EXCLUDED.morning_hour, evening_hour = EXCLUDED.evening_hour,
      failures = 0`;

  return json({ ok: true });
};

export const config: Config = { path: '/api/push/subscribe' };
