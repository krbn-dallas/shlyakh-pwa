import type { L10n, Lang } from '@/shared/model/types';

/** Reads a localized field with a uk fallback — data may lag behind the UI. */
export const tr = (v: L10n | undefined, lang: Lang): string =>
  !v ? '' : (v[lang] || v.uk || v.en || '');
