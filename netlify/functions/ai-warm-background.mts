import { sql } from './_lib.mts';
import { cacheKey, generate, PROMPTS, type Ctx } from './_gemini.mts';

/**
 * Background function: Netlify gives these 15 minutes, which is what a model
 * answering in 40 seconds actually needs. Fills ai_cache so the next request
 * from the app is instant.
 */
export default async (req: Request) => {
  let c: Ctx;
  try { c = await req.json() as Ctx; } catch { return new Response('bad json', { status: 400 }); }
  if (!c?.kind || !(c.kind in PROMPTS)) return new Response('unknown kind', { status: 400 });

  const key = cacheKey(c);
  if (!key) return new Response('not cacheable', { status: 400 });

  // The model is frequently at capacity and answers 503 in well under a second.
  // A background function has fifteen minutes, so keep asking rather than
  // giving up — this is exactly the work that does not need to be synchronous.
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let payload: unknown | null = null;
  for (let attempt = 0; attempt < 12 && !payload; attempt++) {
    if (attempt) await sleep(Math.min(20_000, 3_000 * attempt));
    payload = await generate(c, 60_000);
  }
  if (!payload) return new Response('generation failed', { status: 502 });

  await sql`
    INSERT INTO ai_cache (key, payload) VALUES (${key}, ${JSON.stringify(payload)})
    ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, created_at = now()`;

  return new Response('ok');
};
