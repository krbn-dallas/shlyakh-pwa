import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CityId, Lang, Party, Rates, Stay } from '@/shared/model/types';

export type Theme = 'light' | 'dark' | 'system';
export type { CityId, Lang } from '@/shared/model/types';

/** Trip contexts you can be "in". Other Moroccan cities are browsable but not contexts. */
export const PRIMARY_CITIES: CityId[] = ['kyiv', 'chisinau', 'marrakech'];

interface State {
  // settings
  theme: Theme;
  lang: Lang;
  city: CityId;
  cityManual: boolean;

  // trip — collected in onboarding, never hardcoded
  departure: string | null;      // ISO YYYY-MM-DD
  ret: string | null;            // ISO YYYY-MM-DD
  party: Party;
  stays: Partial<Record<CityId, Stay>>;
  rates: Rates;                  // per 1 EUR

  // flags
  onboarded: boolean;
  geoAsked: boolean;
  installDismissed: boolean;

  // checklist
  checklist: Record<string, boolean>;
  customCheck: { id: string; text: string; section: string }[];

  // phrasebook
  favPhrases: string[];

  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  setCity: (c: CityId, manual?: boolean) => void;
  clearCityManual: () => void;
  setDeparture: (d: string | null) => void;
  setReturn: (d: string | null) => void;
  setParty: (p: Partial<Party>) => void;
  setStay: (c: CityId, s: Stay | null) => void;
  setRates: (r: Partial<Rates>) => void;
  setOnboarded: (v: boolean) => void;
  setGeoAsked: (v: boolean) => void;
  dismissInstall: () => void;
  toggleCheck: (id: string) => void;
  addCustom: (text: string, section: string) => void;
  removeCustom: (id: string) => void;
  resetCheck: () => void;
  toggleFav: (id: string) => void;
  resetAll: () => void;
}

export const resolveTheme = (t: Theme): 'light' | 'dark' =>
  t === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : t;

export const applyTheme = (t: Theme) => {
  const resolved = resolveTheme(t);
  document.documentElement.setAttribute('data-theme', resolved);
  document.querySelector('meta[name="theme-color"]:not([media])')
    ?.setAttribute('content', resolved === 'dark' ? '#14100D' : '#FAF6EE');
};

const DEFAULTS = {
  theme: 'light' as Theme,
  lang: 'uk' as Lang,
  city: 'marrakech' as CityId,
  cityManual: false,
  departure: null,
  ret: null,
  party: { partner: false, kids: 0 } as Party,
  stays: {} as Partial<Record<CityId, Stay>>,
  rates: { uah: 46, mdl: 19.5, mad: 10.8 } as Rates,
  onboarded: false,
  geoAsked: false,
  installDismissed: false,
  checklist: {} as Record<string, boolean>,
  customCheck: [] as { id: string; text: string; section: string }[],
  favPhrases: [] as string[],
};

export const useStore = create<State>()(persist((set, get) => ({
  ...DEFAULTS,

  setTheme: (theme) => { applyTheme(theme); set({ theme }); },
  setLang: (lang) => { document.documentElement.setAttribute('lang', lang); set({ lang }); },
  setCity: (city, manual = false) => set({ city, cityManual: manual || get().cityManual }),
  clearCityManual: () => set({ cityManual: false }),
  setDeparture: (departure) => set({ departure }),
  setReturn: (ret) => set({ ret }),
  setParty: (p) => set({ party: { ...get().party, ...p } }),
  setStay: (c, s) => set({ stays: { ...get().stays, [c]: s ?? undefined } }),
  setRates: (r) => set({ rates: { ...get().rates, ...r } }),
  setOnboarded: (onboarded) => set({ onboarded }),
  setGeoAsked: (geoAsked) => set({ geoAsked }),
  dismissInstall: () => set({ installDismissed: true }),

  toggleCheck: (id) => set({ checklist: { ...get().checklist, [id]: !get().checklist[id] } }),
  addCustom: (text, section) =>
    set({ customCheck: [...get().customCheck, { id: `custom-${Date.now()}`, text, section }] }),
  removeCustom: (id) => {
    const { [id]: _drop, ...checklist } = get().checklist;
    set({ customCheck: get().customCheck.filter((c) => c.id !== id), checklist });
  },
  resetCheck: () => set({ checklist: {}, customCheck: [] }),
  toggleFav: (id) => set({
    favPhrases: get().favPhrases.includes(id)
      ? get().favPhrases.filter((f) => f !== id)
      : [...get().favPhrases, id],
  }),
  resetAll: () => {
    localStorage.clear();
    set({ ...DEFAULTS });
  },
}), {
  name: 'shlyakh',
  version: 2,
  // v1 kept a parallel set of `shlyakh.*` keys that could drift from the persisted
  // blob. Fold anything worth keeping into v2 and let the old keys die.
  migrate: (persisted, version) => {
    const s = { ...DEFAULTS, ...(persisted as Partial<State>) };
    if (version < 2) {
      const lang = localStorage.getItem('shlyakh.lang');
      s.lang = lang === 'en' ? 'en' : 'uk';         // ru is gone
      const dep = localStorage.getItem('shlyakh.dates');
      if (dep && !s.departure) s.departure = dep;
      try {
        s.checklist = JSON.parse(localStorage.getItem('shlyakh.checklist') || '{}');
      } catch { s.checklist = {}; }
      // The old onboarding asked nothing, so a v1 "onboarded" flag means nothing here.
      s.onboarded = false;
      ['theme', 'lang', 'city', 'cityManual', 'dates', 'onboarded', 'checklist', 'check.custom']
        .forEach((k) => localStorage.removeItem(`shlyakh.${k}`));
      localStorage.removeItem('shlyakh-store');
    }
    return s;
  },
}));

/** Trip is only "configured" once onboarding has supplied a departure date. */
export const hasTrip = (s: Pick<State, 'departure'>) => Boolean(s.departure);

// Paint the theme before React mounts so there is no light flash in dark mode.
try {
  const raw = localStorage.getItem('shlyakh');
  const saved = raw ? (JSON.parse(raw).state as Partial<State>) : null;
  applyTheme(saved?.theme ?? 'light');
  if (saved?.lang) document.documentElement.setAttribute('lang', saved.lang);
} catch {
  applyTheme('light');
}
