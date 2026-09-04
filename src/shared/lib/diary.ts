import { idb } from './idb';
import type { DayTask, DiaryEntry, DiaryMedia } from '@/shared/model/diary';
import { toISO } from './trip';

const uid = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const now = () => new Date().toISOString();

// ---- space (one household's diary) ----------------------------------------

const SPACE_KEY = 'shlyakh.space';

export function getSpace(): string {
  let s = localStorage.getItem(SPACE_KEY);
  if (!s) {
    // Readable enough to type onto a second phone, random enough not to guess.
    s = Array.from(crypto.getRandomValues(new Uint8Array(9)))
      .map((b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
    localStorage.setItem(SPACE_KEY, s);
  }
  return s;
}

export function setSpace(code: string): boolean {
  const c = code.trim().toLowerCase();
  if (!/^[a-z0-9-]{8,64}$/.test(c)) return false;
  localStorage.setItem(SPACE_KEY, c);
  return true;
}

// ---- entries ---------------------------------------------------------------

export async function getEntry(day: string): Promise<DiaryEntry | undefined> {
  const all = await idb.all<DiaryEntry>('entries');
  return all.find((e) => e.day === day && !e.deleted);
}

export async function allEntries(): Promise<DiaryEntry[]> {
  const all = await idb.all<DiaryEntry>('entries');
  return all.filter((e) => !e.deleted).sort((a, b) => a.day.localeCompare(b.day));
}

export async function upsertEntry(day: string, patch: Partial<DiaryEntry>): Promise<DiaryEntry> {
  const existing = await getEntry(day);
  const entry: DiaryEntry = {
    id: existing?.id ?? uid(),
    day,
    prompts: [],
    answers: {},
    ...existing,
    ...patch,
    updatedAt: now(),
    synced: false,
  };
  await idb.put('entries', entry);
  return entry;
}

export async function setTaskDone(day: string, index: number, done: boolean) {
  const e = await getEntry(day);
  if (!e) return;
  const prompts: DayTask[] = e.prompts.map((p, i) => (i === index ? { ...p, done } : p));
  await upsertEntry(day, { prompts });
}

// ---- media -----------------------------------------------------------------

export async function addMedia(
  entryId: string,
  kind: DiaryMedia['kind'],
  blob: Blob,
  extra: Partial<DiaryMedia> = {},
): Promise<DiaryMedia> {
  const m: DiaryMedia = {
    id: uid(),
    entryId,
    kind,
    blob,
    // A little tilt each way so the page looks taped together, not laid out.
    rotation: Math.round((Math.random() * 6 - 3) * 10) / 10,
    takenAt: now(),
    updatedAt: now(),
    synced: false,
    ...extra,
  };
  await idb.put('media', m);
  return m;
}

export const mediaFor = (entryId: string) =>
  idb.byIndex<DiaryMedia>('media', 'entryId', entryId)
    .then((rows) => rows.filter((m) => !m.deleted));

export async function updateMedia(id: string, patch: Partial<DiaryMedia>) {
  const m = await idb.get<DiaryMedia>('media', id);
  if (!m) return;
  await idb.put('media', { ...m, ...patch, updatedAt: now(), synced: false });
}

export const deleteMedia = (id: string) => updateMedia(id, { deleted: true });

/** Blob if it is still local, otherwise the uploaded URL. */
export const mediaSrc = (m: DiaryMedia): string =>
  m.blob ? URL.createObjectURL(m.blob) : (m.url ?? '');

// ---- the page list ---------------------------------------------------------

/** One page per day of the trip, whether or not anything is written yet. */
export function tripDays(departure: string, ret: string): string[] {
  const days: string[] = [];
  const [y, m, d] = departure.split('-').map(Number);
  const cur = new Date(y, m - 1, d);
  const end = ret;
  for (let i = 0; i < 90; i++) {
    const iso = toISO(cur);
    days.push(iso);
    if (iso >= end) break;
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}
