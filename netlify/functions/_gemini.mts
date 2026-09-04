/**
 * Prompt templates and the raw Gemini call, shared by the fast endpoint and the
 * background warmer. Kept apart from the handlers so both use exactly the same
 * text — a cached answer and a fresh one must be interchangeable.
 */
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

export const PROMPTS: Record<Kind, (c: Ctx, L: string) => string> = {
  dayTasks: (c, L) => `Ти — теплий уважний супутник у подорожі. Мова відповіді: ${L}.
Місто: ${c.city ?? 'Марракеш'}. День ${c.dayNumber ?? 1} з ${c.totalDays ?? 6}. Погода: ${c.weather ?? 'невідома'}.
Придумай рівно 3 маленькі приємні завдання на сьогодні для жінки, яка подорожує з чоловіком.

ОБОВʼЯЗКОВІ ПРАВИЛА:
- легко виконати за 10–20 хвилин, без спеціальної підготовки і без витрат понад кілька євро;
- цілком безпечно: жодного ризику для життя чи здоровʼя, нічого вночі на порожніх вулицях,
  нічого про алкоголь, нічого, де треба лізти, стрибати, торкатися тварин чи заходити в закриті зони;
- жодної вульгарності, жодних натяків, нічого про тіло чи інтим;
- нічого, що може образити місцевих або порушити місцеві звичаї;
- конкретно і прив'язано до цього міста, а не абстрактно;
- теплий, легкий тон — це має бути приємно, а не як домашнє завдання.

Одне завдання — про фото. Одне — про запах, смак або звук. Одне — про людей, розмову або дрібну деталь міста.
Без нумерації, без вступу.
Поверни СУВОРО JSON: {"tasks":[{"icon":"camera|nose|ear|comment|walk|food","text":"..."}]}`,

  eveningQuestions: (c, L) => `Мова: ${L}. Місто: ${c.city ?? ''}. Це вечірня сторінка щоденника подорожі.
Мандрівниця сьогодні планувала: "${c.planned ?? '—'}".
Придумай 3 короткі теплі питання про сьогоднішній день. Не банальні: питай про деталі, запахи, дрібниці, відчуття.
Поверни СУВОРО JSON: {"questions":["...","...","..."]}`,

  fact: (c, L) => `Мова: ${L}. Місто: ${c.city ?? 'Марракеш'}.
Один короткий несподіваний факт про це місто або країну — 1–2 речення, який справді дивує.
Без вступу і без "чи знали ви". Поверни СУВОРО JSON: {"fact":"..."}`,

  reflect: (c, L) => `Мова: ${L}. Ось нотатки за день з щоденника подорожі:
"""${(c.notes ?? '').slice(0, 4000)}"""
Напиши 2–3 речення підсумку від першої особи однини жіночого роду, теплим живим тоном, як у справжньому щоденнику.
Без кліше, без "цей день був незабутнім". Зачепися за конкретну деталь із нотаток.
Поверни СУВОРО JSON: {"summary":"..."}`,

  translate: (c) => `Translate the following text to Ukrainian. Keep it natural and concise.
Return STRICTLY JSON: {"text":"..."}
Text:
"""${(c.text ?? '').slice(0, 4000)}"""`,
};

/** Stable cache key. Personal kinds (reflect/translate) are never cached. */
export function cacheKey(c: Ctx): string | null {
  if (c.kind === 'reflect' || c.kind === 'translate') return null;
  const parts = [c.kind, c.lang ?? 'uk', (c.city ?? '').toLowerCase(), c.day ?? '', c.dayNumber ?? ''];
  return parts.join('|');
}

const MODEL = 'gemini-flash-latest';

/** One Gemini call. `budgetMs` bounds it; callers decide what that budget is. */
export async function generate(c: Ctx, budgetMs: number): Promise<unknown | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const L = c.lang === 'en' ? 'English' : 'Ukrainian';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), budgetMs);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
        signal: ctrl.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPTS[c.kind](c, L) }] }],
          generationConfig: {
            temperature: 0.9,
            responseMimeType: 'application/json',
            // Thinking triples the latency and this model is already slow.
            thinkingConfig: { thinkingBudget: 0 },
            maxOutputTokens: 700,
          },
        }),
      },
    );
    if (!res.ok) return null;
    const j = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    let raw = (j.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
    // The model sometimes wraps JSON in a markdown fence despite the mime type.
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try { return JSON.parse(raw); } catch { return null; }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
