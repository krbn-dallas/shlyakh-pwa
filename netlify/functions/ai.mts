import type { Config } from '@netlify/functions';
import { bad, body, json, sql } from './_lib.mts';
import { cacheKey, pollBackground, PROMPTS, startBackground, type Ctx } from './_gemini.mts';

/**
 * The model answers in roughly 15–60 seconds, which no synchronous function can
 * wait for. So this endpoint never waits:
 *
 *   1. a cached answer is returned immediately;
 *   2. an in-flight background interaction is polled once and cached if ready;
 *   3. otherwise a background interaction is started and 202 returned.
 *
 * The app shows its own curated prompts meanwhile and picks up the real ones on
 * the next open. The key never leaves the server, and only these fixed prompt
 * templates are reachable — this cannot be used as a general-purpose LLM proxy.
 */
const STALE_JOB_MS = 5 * 60 * 1000;

export default async (req: Request) => {
  if (req.method !== 'POST') return bad('POST only', 405);
  if (!process.env.GEMINI_API_KEY) return bad('AI is not configured', 503);

  const c = await body<Ctx>(req);
  if (!c || !c.kind || !(c.kind in PROMPTS)) return bad('unknown kind');

  const key = cacheKey(c);

  // Uncacheable kinds (reflect, translate) are personal — run them inline and
  // let the client fall back if the model is slow.
  if (!key) {
    const id = await startBackground(c);
    if (!id) return bad('upstream unavailable', 503);
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 2200));
      const p = await pollBackground(id, 2000);
      if (p.state === 'done') return json(p.payload);
      if (p.state === 'failed') break;
    }
    return json({ pending: true, job: id }, 202);
  }

  const rows = await sql`SELECT payload, job_id, job_started FROM ai_cache WHERE key = ${key}`;
  const row = rows[0] as { payload?: unknown; job_id?: string; job_started?: string } | undefined;

  if (row?.payload) return json({ ...(row.payload as object), cached: true });

  // A job is already running for this key — see whether it has landed.
  if (row?.job_id) {
    const started = row.job_started ? Date.parse(row.job_started) : 0;
    const stale = Date.now() - started > STALE_JOB_MS;
    if (!stale) {
      const p = await pollBackground(row.job_id);
      if (p.state === 'done') {
        await sql`
          UPDATE ai_cache SET payload = ${JSON.stringify(p.payload)}, job_id = NULL
          WHERE key = ${key}`;
        return json({ ...(p.payload as object), cached: false });
      }
      if (p.state === 'pending') return json({ pending: true }, 202);
    }
    await sql`UPDATE ai_cache SET job_id = NULL WHERE key = ${key}`;
  }

  const id = await startBackground(c);
  if (!id) return bad('upstream unavailable', 503);

  await sql`
    INSERT INTO ai_cache (key, job_id, job_started) VALUES (${key}, ${id}, now())
    ON CONFLICT (key) DO UPDATE SET job_id = EXCLUDED.job_id, job_started = now()`;

  return json({ pending: true }, 202);
};

export const config: Config = { path: '/api/ai' };
