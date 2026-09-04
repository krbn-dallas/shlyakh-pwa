import { idb } from './idb';
import { getSpace } from './diary';
import type { DiaryEntry, DiaryMedia } from '@/shared/model/diary';

/**
 * Pushes anything unsynced to Postgres and pulls back what the other phone
 * wrote. Media blobs go straight to Cloudinary with a signature fetched from
 * our own function, so the API secret never reaches the browser.
 */
const LAST_SYNC = 'lastSync';

async function uploadBlob(blob: Blob, kind: DiaryMedia['kind']): Promise<{ url: string; publicId: string } | null> {
  const sigRes = await fetch(`/api/upload-sign?space=${getSpace()}`);
  if (!sigRes.ok) return null;
  const sig = await sigRes.json() as {
    endpoint: string; apiKey: string; timestamp: number; folder: string; signature: string;
  };

  const form = new FormData();
  const ext = kind === 'audio' ? 'webm' : kind === 'video' ? 'mp4' : 'jpg';
  form.append('file', blob, `${Date.now()}.${ext}`);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  const up = await fetch(sig.endpoint, { method: 'POST', body: form });
  if (!up.ok) return null;
  const j = await up.json() as { secure_url: string; public_id: string };
  return { url: j.secure_url, publicId: j.public_id };
}

export interface SyncResult { pushed: number; pulled: number; uploaded: number; }

export async function syncDiary(): Promise<SyncResult> {
  if (!navigator.onLine) throw new Error('offline');
  const space = getSpace();

  const entries = await idb.all<DiaryEntry>('entries');
  const media = await idb.all<DiaryMedia>('media');

  // 1. Upload blobs that have not reached Cloudinary yet.
  let uploaded = 0;
  for (const m of media) {
    if (m.url || !m.blob || m.deleted) continue;
    const res = await uploadBlob(m.blob, m.kind);
    if (res) {
      // Keep the local blob too — it is what makes the page work offline.
      await idb.put('media', { ...m, url: res.url, publicId: res.publicId, synced: false });
      uploaded++;
    }
  }

  const fresh = await idb.all<DiaryMedia>('media');

  // 2. Push. Blobs are stripped — only the Cloudinary URL travels.
  const payload = {
    entries: entries.filter((e) => !e.synced).map((e) => ({
      id: e.id, day: e.day, city: e.city ?? null, mood: e.mood ?? null,
      weather_code: e.weatherCode ?? null, temp_c: e.tempC ?? null,
      morning_plan: e.morningPlan ?? null, evening_note: e.eveningNote ?? null,
      prompts: e.prompts, answers: { ...e.answers, __q: e.questions ?? [] },
      lat: e.lat ?? null, lon: e.lon ?? null,
      updated_at: e.updatedAt, deleted: e.deleted ?? false,
    })),
    media: fresh.filter((m) => !m.synced && m.url).map((m) => ({
      id: m.id, entry_id: m.entryId, kind: m.kind, url: m.url!,
      public_id: m.publicId ?? null, caption: m.caption ?? null,
      lat: m.lat ?? null, lon: m.lon ?? null, taken_at: m.takenAt ?? null,
      rotation: m.rotation, updated_at: m.updatedAt, deleted: m.deleted ?? false,
    })),
  };

  if (payload.entries.length || payload.media.length) {
    const res = await fetch(`/api/diary?space=${space}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`push ${res.status}`);
    for (const e of entries) if (!e.synced) await idb.put('entries', { ...e, synced: true });
    for (const m of fresh) if (!m.synced && m.url) await idb.put('media', { ...m, synced: true });
  }

  // 3. Pull whatever the other device changed.
  const since = (await idb.get<string>('meta', LAST_SYNC)) ?? '1970-01-01T00:00:00Z';
  const pullRes = await fetch(`/api/diary?space=${space}&since=${encodeURIComponent(since)}`);
  if (!pullRes.ok) throw new Error(`pull ${pullRes.status}`);
  const remote = await pullRes.json() as {
    entries: Record<string, unknown>[]; media: Record<string, unknown>[]; now: string;
  };

  let pulled = 0;
  for (const r of remote.entries) {
    const id = r.id as string;
    const local = entries.find((e) => e.id === id);
    if (local && local.updatedAt >= String(r.updated_at)) continue;
    const answers = (r.answers ?? {}) as Record<string, unknown>;
    const { __q, ...plain } = answers as { __q?: string[] };
    await idb.put<DiaryEntry>('entries', {
      id,
      day: String(r.day).slice(0, 10),
      city: (r.city as string) ?? undefined,
      mood: (r.mood as number) ?? undefined,
      weatherCode: (r.weather_code as number) ?? undefined,
      tempC: (r.temp_c as number) ?? undefined,
      morningPlan: (r.morning_plan as string) ?? undefined,
      eveningNote: (r.evening_note as string) ?? undefined,
      prompts: (r.prompts as DiaryEntry['prompts']) ?? [],
      answers: plain as Record<string, string>,
      questions: __q,
      lat: (r.lat as number) ?? undefined,
      lon: (r.lon as number) ?? undefined,
      updatedAt: String(r.updated_at),
      deleted: Boolean(r.deleted),
      synced: true,
    });
    pulled++;
  }

  for (const r of remote.media) {
    const id = r.id as string;
    const local = fresh.find((m) => m.id === id);
    if (local && local.updatedAt >= String(r.updated_at)) continue;
    await idb.put<DiaryMedia>('media', {
      id,
      entryId: r.entry_id as string,
      kind: r.kind as DiaryMedia['kind'],
      url: r.url as string,
      publicId: (r.public_id as string) ?? undefined,
      caption: (r.caption as string) ?? undefined,
      lat: (r.lat as number) ?? undefined,
      lon: (r.lon as number) ?? undefined,
      takenAt: (r.taken_at as string) ?? undefined,
      rotation: (r.rotation as number) ?? 0,
      updatedAt: String(r.updated_at),
      deleted: Boolean(r.deleted),
      synced: true,
      blob: local?.blob,
    });
    pulled++;
  }

  await idb.put('meta', remote.now, LAST_SYNC);
  return { pushed: payload.entries.length + payload.media.length, pulled, uploaded };
}
