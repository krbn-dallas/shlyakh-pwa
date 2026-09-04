import type { Lang } from '@/shared/model/types';

/**
 * Short data-level strings — POI tags and opening-hours phrases — are authored
 * in Ukrainian. Rather than turning every one into an L10n object, they are
 * translated through this lookup. Anything absent falls through unchanged,
 * which is correct for the language-neutral tokens (UNESCO, ONCF, 24/7, EUR…).
 */
const EN: Record<string, string> = {
  // places & context
  'центр': 'centre', 'вечір': 'evening', 'орієнтир': 'landmark', 'панорама': 'panorama',
  'захід сонця': 'sunset', 'фото': 'photo spot', 'історія': 'history', 'архітектура': 'architecture',
  'музей': 'museum', 'палац': 'palace', 'руїни': 'ruins', 'сад': 'garden', 'тиша': 'quiet',
  'спокійно': 'calm', 'прогулянка': 'walk', 'океан': 'ocean', 'пляж': 'beach', 'гори': 'mountains',
  'Атлас': 'Atlas', 'Геліз': 'Guéliz', 'пішохідна': 'car-free', 'укриття': 'shelter',
  'кіно': 'film location', 'старт': 'start',
  // shopping
  'торг': 'haggle', 'без торгу': 'fixed price', 'орієнтир цін': 'price benchmark',
  'аргана': 'argan oil', 'спеції': 'spices', 'шафран': 'saffron', 'сувеніри': 'souvenirs',
  'кераміка': 'ceramics', 'зелідж': 'zellij', 'шкіра': 'leather', 'метал': 'metalwork',
  'дерево': 'woodwork', 'ремесла': 'crafts', 'парфуми': 'perfume', 'каптани': 'kaftans',
  'мода': 'fashion', 'дизайн': 'design', 'бренди': 'brands', 'шопінг': 'shopping',
  'ринок': 'market', 'кооператив': 'co-op', 'сертифікат': 'certified', 'автентично': 'authentic',
  'Поділ': 'Podil', 'ТРЦ': 'mall', 'бронювання': 'book ahead', 'озеро': 'lake',
  'подарунки': 'gifts', 'українське': 'Ukrainian-made', 'фудкорт': 'food hall',
  'українська кухня': 'Ukrainian food', 'молдовська кухня': 'Moldovan food',
  // food
  'кава': 'coffee', 'кафе': 'café', 'тераса': 'terrace', 'сніданок': 'breakfast',
  'обід': 'lunch', 'вечеря': 'dinner', 'риба': 'seafood', 'вино': 'wine',
  // services & transport
  'аеропорт': 'airport', 'потяг': 'train', 'автобус': 'bus', 'трамвай': 'tram',
  'банк': 'bank', 'банкомат': 'ATM', 'офіційний': 'official', 'обмін': 'exchange',
  'дешево': 'cheap', 'виліт': 'departure', 'чергова': 'on duty', 'готель': 'hotel',
  'ріад': 'riad', 'хаммам': 'hammam', 'екскурсія': 'tour', 'посольство': 'embassy',
  'важливо': 'important', "обов'язково": 'must see', 'онлайн-квиток': 'book online',
  // opening hours phrases
  'цілодобово': 'open 24 hours',
  'сади цілодобово': 'gardens open 24 hours',
  'магазини з 10:00': 'shops from 10:00',
  'залежить від закладу': 'varies by venue',
  'виїзд ~07:30': 'departs ~07:30',
  'пн–пт 09:00–18:00': 'Mon–Fri 09:00–18:00',
  '10:00–18:00, ср вихідний': '10:00–18:00, closed Wed',
  '09:00–20:00, пт коротший день': '09:00–20:00, shorter on Fri',
  '06:00–20:00, пн вихідний': '06:00–20:00, closed Mon',
  'екскурсії 09:00–15:00, крім пт': 'tours 09:00–15:00, except Fri',
  '20:00–09:00 за графіком': '20:00–09:00 on rota',
  '06:00–23:00 (може змінюватись)': '06:00–23:00 (may change)',
  'більшість 08:00–22:00, є 24/7': 'mostly 08:00–22:00, some 24/7',
};

/** Translate a short data token; unknown values pass through untouched. */
export const token = (value: string | undefined, lang: Lang): string =>
  !value ? '' : lang === 'en' ? (EN[value] ?? value) : value;
