/**
 * open.er-api.com: free, no key, CORS-open, updated daily.
 * Falls back to the stored manual rates when offline — the Home card stays useful.
 */
import type { Rates } from '@/shared/model/types';

export interface LiveRates extends Rates { updated: string; }

export async function fetchRates(signal?: AbortSignal): Promise<LiveRates> {
  const res = await fetch('https://open.er-api.com/v6/latest/EUR', { signal });
  if (!res.ok) throw new Error(`rates ${res.status}`);
  const j = await res.json() as {
    result: string;
    time_last_update_utc: string;
    rates: Record<string, number>;
  };
  if (j.result !== 'success') throw new Error('rates: unsuccessful response');
  const { UAH, MDL, MAD } = j.rates ?? {};
  if (!UAH || !MDL || !MAD) throw new Error('rates: incomplete response');
  const round = (n: number) => Math.round(n * 100) / 100;
  return { uah: round(UAH), mdl: round(MDL), mad: round(MAD), updated: j.time_last_update_utc };
}
