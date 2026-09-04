import type { Config } from '@netlify/functions';
import { bad, body, json, sql } from './_lib.mts';
import { cacheKey, generate, PROMPTS, type Ctx } from './_gemini.mts';

/**
 * Gemini is currently answering in 15–45s — far past a synchronous function's
 * budget. So this endpoint:
 *   1. returns a cached answer instantly if one exists,
 *   2. otherwise tries a short generation (often enough when the model is calm),
 *   3. and failing that, kicks off a background warm and tells the client to
 *      use its own fallback for now. The next open gets the real thing.
 *
 * The key never leaves the server, and only these fixed templates are callable.
 */
const FAST_BUDGET_MS = 7000;

export default async (req: Request) => {
  if (req.method !== 'POST') return bad('POST only', 405);
  if (!process.env.GEMINI_API_KEY) return bad('AI is not configured', 503);

  const c = await body<Ctx>(req);
  if (!c || !c.kind || !(c.kind in PROMPTS)) return bad('unknown kind');

  const key = cacheKey(c);

  if (key) {
    const hit = await sql`SELECT payload FROM ai_cache WHERE key = ${key}`;
    if (hit.length) return json({ ...(hit[0].payload as object), cached: true });
  }

  const fresh = await generate(c, FAST_BUDGET_MS);
  if (fresh) {
    if (key) {
      await sql`
        INSERT INTO ai_cache (key, payload) VALUES (${key}, ${JSON.stringify(fresh)})
        ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, created_at = now()`;
    }
    return json(fresh);
  }

  // Warm it out-of-band; the client shows its built-in prompts meanwhile.
  if (key) {
    const url = new URL(req.url);
    void fetch(`${url.origin}/.netlify/functions/ai-warm-background`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(c),
    }).catch(() => { /* fire and forget */ });
  }

  return json({ pending: true }, 202);
};

export const config: Config = { path: '/api/ai' };
