export type MediaKind = 'photo' | 'audio' | 'video';

export interface DiaryMedia {
  id: string;
  entryId: string;
  kind: MediaKind;
  /** Cloudinary URL once synced; until then the local blob is the source. */
  url?: string;
  publicId?: string;
  /** Object URL for a not-yet-uploaded blob, resolved at read time. */
  blob?: Blob;
  caption?: string;
  lat?: number;
  lon?: number;
  takenAt?: string;
  /** Degrees of tilt so it sits on the page like a taped-in print. */
  rotation: number;
  durationS?: number;
  updatedAt: string;
  deleted?: boolean;
  synced?: boolean;
}

export interface DayTask {
  icon: string;
  text: string;
  done?: boolean;
}

export interface DiaryEntry {
  id: string;
  /** ISO date, YYYY-MM-DD — one page per day. */
  day: string;
  city?: string;
  /** 1..5 */
  mood?: number;
  weatherCode?: number;
  tempC?: number;
  morningPlan?: string;
  eveningNote?: string;
  /** Morning tasks, generated once per day and then cached. */
  prompts: DayTask[];
  /** Evening questions → answers. */
  answers: Record<string, string>;
  questions?: string[];
  lat?: number;
  lon?: number;
  updatedAt: string;
  deleted?: boolean;
  synced?: boolean;
}

export const MOODS = ['😞', '😕', '🙂', '😄', '🤩'] as const;
