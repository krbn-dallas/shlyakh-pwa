import type { Config } from '@netlify/functions';
import webpush from 'web-push';
import { sql } from './_lib.mts';

/**
 * Runs hourly. For each subscription it works out the local hour in that
 * device's own timezone and sends the morning nudge or the evening one, at most
 * once per slot per day. Subscriptions the push service rejects as gone (404 or
 * 410) are deleted rather than retried forever.
 */
const COPY = {
  uk: {
    morning: ['Доброго ранку', 'Три маленькі завдання чекають на сторінці сьогоднішнього дня'],
    evening: ['Як минув день?', 'Запиши, поки не забулося — навіть одне речення рахується'],
  },
  en: {
    morning: ['Good morning', 'Three small quests are waiting on today’s page'],
    evening: ['How was the day?', 'Write it down before it fades — one sentence counts'],
  },
} as const;

const localHourAndDay = (tz: string) => {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    hour: Number(parts.hour),
    day: `${parts.year}-${parts.month}-${parts.day}`,
  };
};

export default async () => {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return new Response('push not configured', { status: 503 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:noreply@shlyakh.app', pub, priv);

  const subs = await sql`SELECT * FROM push_sub WHERE failures < 5`;
  let sent = 0, cleaned = 0;

  for (const s of subs) {
    const tz = (s.tz as string) || 'Europe/Kyiv';
    let local;
    try { local = localHourAndDay(tz); } catch { local = localHourAndDay('Europe/Kyiv'); }

    // Only nudge while the trip is actually running.
    const dep = s.departure ? String(s.departure).slice(0, 10) : null;
    const ret = s.ret ? String(s.ret).slice(0, 10) : null;
    if (dep && local.day < dep) continue;
    if (ret && local.day > ret) continue;

    const slot = local.hour === Number(s.morning_hour) ? 'morning'
      : local.hour === Number(s.evening_hour) ? 'evening' : null;
    if (!slot) continue;

    const stamp = `${local.day}:${slot}`;
    if (s.last_sent === stamp) continue;                 // already nudged this slot

    const lang = (s.lang === 'en' ? 'en' : 'uk') as 'uk' | 'en';
    const [title, bodyText] = COPY[lang][slot];

    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint as string, keys: { p256dh: s.p256dh as string, auth: s.auth as string } },
        JSON.stringify({ title, body: bodyText, url: '/diary', tag: `diary-${slot}` }),
        { TTL: 3600 },
      );
      await sql`UPDATE push_sub SET last_sent = ${stamp}, failures = 0 WHERE endpoint = ${s.endpoint}`;
      sent++;
    } catch (err) {
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await sql`DELETE FROM push_sub WHERE endpoint = ${s.endpoint}`;
        cleaned++;
      } else {
        await sql`UPDATE push_sub SET failures = failures + 1 WHERE endpoint = ${s.endpoint}`;
      }
    }
  }

  return new Response(JSON.stringify({ checked: subs.length, sent, cleaned }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const config: Config = { schedule: '@hourly' };
