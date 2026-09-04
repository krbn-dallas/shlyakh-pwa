// Data contract for ШЛЯХ. Every /data/*.json file is typed here and read through
// shared/lib/data.ts — no `any` in feature code.

export type Lang = 'uk' | 'en';
export type L10n = Record<Lang, string>;

/** Trip contexts (SOS / taxi / city switcher) are `primary`; the rest are Morocco-wide places. */
export type CityId =
  | 'kyiv' | 'chisinau'
  | 'marrakech' | 'casablanca' | 'fes' | 'rabat'
  | 'tangier' | 'agadir' | 'essaouira' | 'ouarzazate';

export type CountryId = 'ua' | 'md' | 'ma';

export interface City {
  id: CityId;
  country: CountryId;
  primary: boolean;          // shown in the city switcher
  name: L10n;
  flag: string;
  tz: string;
  currency: string;
  center: [number, number];  // [lat, lon]
  bbox: [number, number, number, number]; // [latS, lonW, latN, lonE]
  taxiColor?: L10n;          // petit taxi livery — genuinely useful in Morocco
}

export type EmergencyKind =
  | 'police' | 'medical' | 'fire' | 'rescue' | 'tourist' | 'embassy' | 'general' | 'hospital';

export interface Emergency {
  id: string;
  city: CityId | 'ua' | 'md' | 'ma' | '*';
  kind: EmergencyKind;
  title: L10n;
  number?: string;           // display form, e.g. "112"
  tel?: string;              // dial form, e.g. "+37322582284"
  note?: L10n;
  address?: string;
  hours?: string;
  priority?: number;         // lower sorts first
  verify?: boolean;          // show "звір за 3–5 днів до виїзду"
}

export interface Taxi {
  id: string;
  city: CityId;
  name: string;
  kind: 'app' | 'phone';
  value: string;             // tel: number or app deep-link / store URL
  note?: L10n;
  warn?: L10n;               // legal-status caveat for ride-hailing in Morocco
}

export type POICat =
  | 'sight' | 'food' | 'shop' | 'market' | 'pharmacy' | 'exchange'
  | 'transport' | 'stay' | 'money' | 'craft' | 'nature';

export interface POI {
  id: string;
  city: CityId;
  cat: POICat;
  name: L10n;
  desc?: L10n;
  lat: number;
  lon: number;
  coordsApprox?: boolean;    // true → UI shows "приблизно" + offers online refresh
  hours?: string;
  price?: L10n;
  tel?: string;
  address?: string;
  tags?: string[];
  fixedPrice?: boolean;      // no haggling — Ensemble Artisanal, malls, co-ops
}

export type SafetyKind = 'zone' | 'scam' | 'rule' | 'women' | 'health' | 'legal';
export type SafetyLevel = 'info' | 'caution' | 'avoid';

export interface SafetyEntry {
  id: string;
  city: CityId | 'ua' | 'md' | 'ma' | '*';
  kind: SafetyKind;
  level: SafetyLevel;
  title: L10n;
  why: L10n;
  tips: L10n[];
  lat?: number;
  lon?: number;
  radiusM?: number;
}

export interface RouteStop { poi: string; dwell: number; note?: L10n; }

export interface WalkRoute {
  id: string;
  city: CityId;
  kind: 'short' | 'scenic' | 'shop';
  icon: string;              // Font Awesome icon name
  title: L10n;
  desc: L10n;
  stops: RouteStop[];
}

export type BlockType = 'move' | 'sight' | 'food' | 'stay' | 'shop' | 'rest' | 'tour';

export interface ItinBlock {
  t: string;                 // "14:00"
  type: BlockType;
  title: L10n;
  detail?: L10n;
  cost?: L10n;
  poi?: string;              // links to a POI id → "показати на карті"
}

export interface ItinDay {
  id: string;
  city: CityId;
  title: L10n;
  summary?: L10n;
  blocks: ItinBlock[];
  stay?: string;
}

/** Who the item is for — filtered by the onboarding "хто їде" answer. */
export type Audience = 'both' | 'her' | 'him' | 'kids';

export interface CheckItem {
  id: string;
  text: L10n;
  audience: Audience;
  qty?: string;
  critical?: boolean;
  note?: L10n;
  perPerson?: boolean;       // quantity scales with party size
}

export interface CheckSection {
  id: string;
  icon: string;              // Font Awesome icon name
  title: L10n;
  note?: L10n;
  items: CheckItem[];
}

export type PhraseCat =
  | 'basics' | 'polite' | 'taxi' | 'bargain' | 'food' | 'hotel' | 'directions'
  | 'health' | 'sos' | 'numbers' | 'time' | 'women' | 'family';

export interface Phrase {
  id: string;
  cat: PhraseCat;
  uk: string;
  en: string;
  fr: string;
  ar: string;                // Arabic script — the "show them this" panel
  ar_lat: string;            // darija transliteration, so you can say it out loud
  ro?: string;               // Moldova leg
}

export interface TransportEntry {
  id: string;
  scope: CityId | 'ua' | 'md' | 'ma';
  kind: 'rail' | 'bus' | 'tram' | 'taxi' | 'air' | 'walk';
  icon: string;
  title: L10n;
  desc: L10n;
  facts: L10n[];
  url?: string;
  tel?: string;
}

export interface GuideItem { title: L10n; body: L10n; tips?: L10n[]; }

export interface GuideSection {
  id: 'culture' | 'money' | 'shopping' | 'events' | 'health';
  icon: string;
  title: L10n;
  intro: L10n;
  items: GuideItem[];
}

// ---- app state shapes (not file-backed) ----

export interface Party { partner: boolean; kids: number; }

export interface Stay {
  name: string;
  address: string;
  lat?: number;
  lon?: number;
}

export interface Rates { uah: number; mdl: number; mad: number; } // per 1 EUR
