import { todayMidnight, toISO } from './trip';

export type TripPhase = 'before' | 'during' | 'after';

/**
 * Drives what the tab bar shows: packing matters before you leave, the diary
 * matters once you have gone.
 */
export function tripPhase(departure: string | null, ret: string | null): TripPhase {
  if (!departure) return 'before';
  const today = toISO(todayMidnight());
  if (today < departure) return 'before';
  if (ret && today > ret) return 'after';
  return 'during';
}
