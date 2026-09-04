import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export const bad = (msg: string, status = 400) => json({ error: msg }, status);

/**
 * A "space" is one household's diary. There is no login: the app generates a
 * random id on first run and the second phone joins by typing the same code.
 * Validated here so a malformed value can never reach a query.
 */
export function space(req: Request): string | null {
  const url = new URL(req.url);
  const s = url.searchParams.get('space') ?? '';
  return /^[a-z0-9-]{8,64}$/i.test(s) ? s : null;
}

export async function body<T>(req: Request): Promise<T | null> {
  try { return (await req.json()) as T; } catch { return null; }
}
