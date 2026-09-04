import type { Lang } from '@/shared/model/types';

const MS_DAY = 86_400_000;

/** Local midnight for an ISO date — avoids the UTC shift that made "today" wrong. */
export const parseDate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const todayMidnight = (): Date => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export const addDays = (iso: string, n: number): Date => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return d;
};

export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Whole days between local midnights — no DST drift. */
export const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / MS_DAY);

export const tripLength = (departure: string, ret: string): number =>
  daysBetween(parseDate(departure), parseDate(ret)) + 1;

export interface TripPosition {
  /** 0-based index into the itinerary, or null when the trip has not started. */
  dayIndex: number | null;
  before: boolean;
  during: boolean;
  after: boolean;
  daysUntil: number;
}

/** Where "now" sits relative to the trip. Fixes the old clamp that always showed day 1. */
export function tripPosition(departure: string | null, ret: string | null, totalDays: number): TripPosition {
  if (!departure) return { dayIndex: null, before: true, during: false, after: false, daysUntil: 0 };
  const start = parseDate(departure);
  const today = todayMidnight();
  const offset = daysBetween(start, today);
  const last = ret ? tripLength(departure, ret) - 1 : totalDays - 1;

  if (offset < 0) return { dayIndex: null, before: true, during: false, after: false, daysUntil: -offset };
  if (offset > last) return { dayIndex: null, before: false, during: false, after: true, daysUntil: 0 };
  return { dayIndex: Math.min(offset, totalDays - 1), before: false, during: true, after: false, daysUntil: 0 };
}

const LOCALE: Record<Lang, string> = { uk: 'uk-UA', en: 'en-GB' };

export const fmtDate = (d: Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) =>
  new Intl.DateTimeFormat(LOCALE[lang], opts).format(d);

export const fmtWeekday = (d: Date, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short' }).format(d);

export interface Countdown { days: number; hours: number; minutes: number; seconds: number; past: boolean; }

export function countdown(departure: string): Countdown {
  const target = parseDate(departure).getTime();
  const diff = target - Date.now();
  const past = diff <= 0;
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / MS_DAY),
    hours: Math.floor((abs / 3_600_000) % 24),
    minutes: Math.floor((abs / 60_000) % 60),
    seconds: Math.floor((abs / 1000) % 60),
    past,
  };
}
