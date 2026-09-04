import { useStore } from '@/app/store';
import type { Lang } from '@/shared/model/types';
import { en } from './en';
import { uk, type Dict } from './uk';

const DICTS: Record<Lang, Dict> = { uk, en };

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Leaves<T[K], `${P}${K}.`>
}[keyof T & string];

export type TKey = Leaves<Dict>;

const read = (dict: unknown, path: string): string => {
  const v = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], dict);
  return typeof v === 'string' ? v : path;
};

export const translate = (lang: Lang, key: TKey, vars?: Record<string, string | number>): string => {
  let s = read(DICTS[lang], key);
  if (s === key && lang !== 'uk') s = read(uk, key);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{{${k}}}`, String(v));
  return s;
};

/** `const { t, lang } = useT()` — the only translation entry point in the UI. */
export function useT() {
  const lang = useStore((s) => s.lang);
  return {
    lang,
    t: (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
  };
}
