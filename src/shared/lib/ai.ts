import type { DayTask } from '@/shared/model/diary';
import type { Lang } from '@/shared/model/types';

/**
 * Talks to the /api/ai function, never to Gemini directly — the key lives on
 * the server. Every call degrades to null rather than throwing: the diary must
 * stay usable when the model, or the network, is unavailable.
 */
async function ask<T>(payload: Record<string, unknown>, signal?: AbortSignal): Promise<T | null> {
  if (!navigator.onLine) return null;
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const aiDayTasks = (
  ctx: { lang: Lang; city: string; dayNumber: number; totalDays: number; weather?: string },
  signal?: AbortSignal,
) => ask<{ tasks: DayTask[] }>({ kind: 'dayTasks', ...ctx }, signal).then((r) => r?.tasks ?? null);

export const aiEveningQuestions = (
  ctx: { lang: Lang; city: string; planned?: string },
  signal?: AbortSignal,
) => ask<{ questions: string[] }>({ kind: 'eveningQuestions', ...ctx }, signal).then((r) => r?.questions ?? null);

export const aiFact = (ctx: { lang: Lang; city: string }, signal?: AbortSignal) =>
  ask<{ fact: string }>({ kind: 'fact', ...ctx }, signal).then((r) => r?.fact ?? null);

export const aiReflect = (ctx: { lang: Lang; notes: string }, signal?: AbortSignal) =>
  ask<{ summary: string }>({ kind: 'reflect', ...ctx }, signal).then((r) => r?.summary ?? null);

/**
 * Offline stand-ins so a page is never empty. Deliberately gentle and easy —
 * the same bar the model is held to: safe, doable in 20 minutes, nothing risky.
 * Picked per day so the pages do not all read the same.
 */
const TASK_POOL: Record<Lang, DayTask[][]> = {
  uk: [
    [{ icon: 'camera', text: 'Сфотографуй двері, які тобі сьогодні найбільше сподобались' },
     { icon: 'nose', text: 'Понюхай три різні спеції на ринку й запам’ятай улюблену' },
     { icon: 'comment', text: 'Скажи «шукран» і подивись, як змінюється обличчя людини' }],
    [{ icon: 'camera', text: 'Знайди найкрасивішу плитку-зелідж і зроби кадр зблизька' },
     { icon: 'food', text: 'Спробуй щось, назви чого не знаєш' },
     { icon: 'ear', text: 'Постій хвилину із заплющеними очима й послухай вулицю' }],
    [{ icon: 'camera', text: 'Зроби фото вас двох там, де сьогодні було найкраще' },
     { icon: 'food', text: 'Випий м’ятного чаю там, де сидять місцеві, а не туристи' },
     { icon: 'comment', text: 'Спитай у когось, як називається страва, яку він їсть' }],
    [{ icon: 'camera', text: 'Сфотографуй небо саме тоді, коли світло стане теплим' },
     { icon: 'walk', text: 'Зверни в провулок, який просто сподобався, і пройди його до кінця' },
     { icon: 'nose', text: 'Знайди запах, за яким потім упізнаєш це місто' }],
    [{ icon: 'camera', text: 'Знайди котика й зроби йому портрет' },
     { icon: 'food', text: 'Купи фрукт, якого раніше не пробувала' },
     { icon: 'comment', text: 'Дізнайся ім’я людини, у якої щось купила' }],
    [{ icon: 'camera', text: 'Сфотографуй свої ноги там, де ви сьогодні дійшли' },
     { icon: 'ear', text: 'Запиши 15 секунд звуку цього місця' },
     { icon: 'walk', text: 'Знайди тінь і посидь у ній десять хвилин просто так' }],
  ],
  en: [
    [{ icon: 'camera', text: 'Photograph the most beautiful door you passed today' },
     { icon: 'nose', text: 'Smell three different spices at the market and pick a favourite' },
     { icon: 'comment', text: 'Say "shukran" and watch the face change' }],
    [{ icon: 'camera', text: 'Find the prettiest zellij tile and take a close-up' },
     { icon: 'food', text: 'Try something whose name you do not know' },
     { icon: 'ear', text: 'Stand still for a minute with your eyes closed and listen' }],
    [{ icon: 'camera', text: 'Get a photo of the two of you where today felt best' },
     { icon: 'food', text: 'Drink mint tea where the locals sit, not the tourists' },
     { icon: 'comment', text: 'Ask someone what the dish they are eating is called' }],
    [{ icon: 'camera', text: 'Photograph the sky at the moment the light turns warm' },
     { icon: 'walk', text: 'Turn down an alley you simply liked and walk it to the end' },
     { icon: 'nose', text: 'Find the smell you will recognise this city by later' }],
    [{ icon: 'camera', text: 'Find a cat and take its portrait' },
     { icon: 'food', text: 'Buy a fruit you have never tried' },
     { icon: 'comment', text: 'Learn the name of the person you bought something from' }],
    [{ icon: 'camera', text: 'Photograph your feet wherever you got to today' },
     { icon: 'ear', text: 'Record 15 seconds of what this place sounds like' },
     { icon: 'walk', text: 'Find shade and sit in it for ten minutes doing nothing' }],
  ],
};

export const fallbackTasks = (lang: Lang, dayNumber = 1): DayTask[] =>
  TASK_POOL[lang][(dayNumber - 1) % TASK_POOL[lang].length];

/** Kept for callers that just want day one. */
export const FALLBACK_TASKS: Record<Lang, DayTask[]> = {
  uk: TASK_POOL.uk[0],
  en: TASK_POOL.en[0],
};

export const FALLBACK_QUESTIONS: Record<Lang, string[]> = {
  uk: [
    'Що сьогодні було найсмачнішим?',
    'Який момент захотілося б повторити?',
    'Що здивувало або спантеличило?',
  ],
  en: [
    'What tasted best today?',
    'Which moment would you live again?',
    'What surprised or confused you?',
  ],
};
