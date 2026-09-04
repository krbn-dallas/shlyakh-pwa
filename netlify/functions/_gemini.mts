/**
 * Gemini via the Interactions API.
 *
 * The older generateContent endpoint only exposed one model to these keys and
 * that model is permanently at capacity. Interactions exposes several, accepts
 * a JSON schema for the response, and — importantly — can run a request in the
 * background and be polled, which is the only sane way to use a model that
 * answers in fifteen to sixty seconds from a ten-second function.
 */
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const REVISION = '2026-05-20';

/** Fastest first. All verified to answer for this key. */
export const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

export type Kind = 'dayTasks' | 'eveningQuestions' | 'fact' | 'reflect' | 'translate';

export interface Ctx {
  kind: Kind;
  lang?: 'uk' | 'en';
  city?: string;
  dayNumber?: number;
  totalDays?: number;
  planned?: string;
  notes?: string;
  weather?: string;
  text?: string;
  day?: string;
}

/** Icon names the app can actually render — the model must pick from these. */
const ICONS = ['camera', 'nose', 'ear', 'comment', 'walk', 'food', 'cafe', 'shop', 'pin', 'museum', 'mountain', 'beach'];

const SCHEMAS: Record<Kind, Record<string, unknown>> = {
  dayTasks: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array', minItems: 3, maxItems: 3,
        items: {
          type: 'object',
          properties: { icon: { type: 'string', enum: ICONS }, text: { type: 'string' } },
          required: ['icon', 'text'],
        },
      },
    },
    required: ['tasks'],
  },
  eveningQuestions: {
    type: 'object',
    properties: { questions: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } } },
    required: ['questions'],
  },
  fact: { type: 'object', properties: { fact: { type: 'string' } }, required: ['fact'] },
  reflect: { type: 'object', properties: { summary: { type: 'string' } }, required: ['summary'] },
  translate: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
};

export const PROMPTS: Record<Kind, (c: Ctx, L: string) => string> = {
  dayTasks: (c, L) => `Ти — теплий уважний супутник у подорожі. Мова відповіді: ${L}.
Місто: ${c.city ?? 'Марокко'}. День ${c.dayNumber ?? 1} з ${c.totalDays ?? 6}. Погода: ${c.weather ?? 'невідома'}.
Придумай рівно 3 маленькі приємні завдання на сьогодні для жінки, яка подорожує з чоловіком.

ОБОВʼЯЗКОВІ ПРАВИЛА:
- легко виконати за 10–20 хвилин, без підготовки і без витрат понад кілька євро;
- цілком безпечно: жодного ризику для життя чи здоров'я, нічого вночі на порожніх вулицях,
  нічого про алкоголь, нічого де треба лізти, стрибати, торкатися тварин чи заходити в закриті зони;
- жодної вульгарності, жодних натяків, нічого про тіло чи інтим;
- нічого, що образить місцевих або порушить місцеві звичаї;
- КОНКРЕТНО про це місто — назви справжні місця, вулиці, страви цього міста, а не загальні слова;
- теплий, легкий тон.

Одне завдання про фото. Одне про запах, смак або звук. Одне про людей чи розмову.`,

  eveningQuestions: (c, L) => `Мова: ${L}. Місто: ${c.city ?? ''}. Це вечірня сторінка щоденника подорожі.
Мандрівниця сьогодні планувала: "${c.planned ?? '—'}".
Придумай 3 короткі теплі питання про сьогоднішній день. Не банальні: питай про деталі, запахи, дрібниці, відчуття.`,

  fact: (c, L) => `Мова: ${L}. Місто: ${c.city ?? 'Марокко'}.
Один короткий несподіваний факт саме про це місто — 1–2 речення, який справді дивує.
Без вступу і без "чи знали ви".`,

  reflect: (c, L) => `Мова: ${L}. Ось нотатки за день з щоденника подорожі:
"""${(c.notes ?? '').slice(0, 4000)}"""
Напиши 2–3 речення підсумку від першої особи однини жіночого роду, теплим живим тоном.
Без кліше, без "цей день був незабутнім". Зачепися за конкретну деталь із нотаток.`,

  translate: (c) => `Translate to Ukrainian, naturally and concisely:
"""${(c.text ?? '').slice(0, 4000)}"""`,
};

/** Stable cache key. Personal kinds are never cached. */
export function cacheKey(c: Ctx): string | null {
  if (c.kind === 'reflect' || c.kind === 'translate') return null;
  return [c.kind, c.lang ?? 'uk', (c.city ?? '').toLowerCase(), c.day ?? '', c.dayNumber ?? ''].join('|');
}

function headers() {
  return {
    'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
    'Content-Type': 'application/json',
    'Api-Revision': REVISION,
  };
}

function requestBody(c: Ctx, model: string, background: boolean) {
  return JSON.stringify({
    model,
    input: PROMPTS[c.kind](c, c.lang === 'en' ? 'English' : 'Ukrainian'),
    response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMAS[c.kind] },
    ...(background ? { background: true } : {}),
  });
}

interface Interaction {
  id?: string;
  status?: string;
  steps?: { type: string; content?: { type: string; text?: string }[] }[];
  error?: { message?: string };
}

/** Pull the model's JSON out of the step list. */
export function extract(j: Interaction): unknown | null {
  for (const step of j.steps ?? []) {
    if (step.type !== 'model_output') continue;
    for (const c of step.content ?? []) {
      if (c.type !== 'text' || !c.text) continue;
      const raw = c.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      try { return JSON.parse(raw); } catch { /* try the next block */ }
    }
  }
  return null;
}

/** A synchronous attempt, bounded so the caller stays inside its budget. */
export async function generate(c: Ctx, budgetMs: number): Promise<unknown | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), budgetMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST', headers: headers(), signal: ctrl.signal,
      body: requestBody(c, MODELS[0], false),
    });
    if (!res.ok) return null;
    return extract(await res.json() as Interaction);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Kicks off a background interaction and returns its id to poll later. */
export async function startBackground(c: Ctx): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  for (const model of MODELS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST', headers: headers(), signal: ctrl.signal,
        body: requestBody(c, model, true),
      });
      if (!res.ok) continue;
      const j = await res.json() as Interaction;
      if (j.id) return j.id;
    } catch {
      // try the next model
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export type PollResult =
  | { state: 'done'; payload: unknown }
  | { state: 'pending' }
  | { state: 'failed' };

/** Checks a background interaction without waiting for it. */
export async function pollBackground(id: string, budgetMs = 5000): Promise<PollResult> {
  if (!process.env.GEMINI_API_KEY) return { state: 'failed' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), budgetMs);
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
      headers: headers(), signal: ctrl.signal,
    });
    if (!res.ok) return { state: 'failed' };
    const j = await res.json() as Interaction;
    if (j.status === 'completed') {
      const payload = extract(j);
      return payload ? { state: 'done', payload } : { state: 'failed' };
    }
    if (j.status === 'failed') return { state: 'failed' };
    return { state: 'pending' };
  } catch {
    return { state: 'pending' };
  } finally {
    clearTimeout(timer);
  }
}
