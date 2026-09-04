import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { fmtDate, fmtWeekday, parseDate, todayMidnight, toISO } from '@/shared/lib/trip';
import { getEntry, mediaFor, setTaskDone, tripDays, upsertEntry } from '@/shared/lib/diary';
import { aiDayTasks, aiEveningQuestions, aiReflect, fallbackTasks, FALLBACK_QUESTIONS } from '@/shared/lib/ai';
import { sfx } from '@/shared/lib/sound';
import { MOODS, type DiaryEntry, type DiaryMedia } from '@/shared/model/diary';
import { Capture } from './Capture';
import { MediaStrip } from './MediaStrip';

/** Debounced auto-save so typing never blocks on IndexedDB. */
function useAutosave(day: string, onSaved: () => void) {
  const timer = useRef<number | undefined>(undefined);
  return useCallback((patch: Partial<DiaryEntry>) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void upsertEntry(day, patch).then(onSaved);
    }, 500);
  }, [day, onSaved]);
}

export default function DiaryPage() {
  const { t, lang } = useT();
  const departure = useStore((s) => s.departure);
  const ret = useStore((s) => s.ret);
  const city = useStore((s) => s.city);
  const { data: itinerary } = useData('itinerary');
  const { data: cities } = useData('cities');

  const days = useMemo(
    () => (departure && ret ? tripDays(departure, ret) : []),
    [departure, ret],
  );

  const todayIso = toISO(todayMidnight());
  const initial = Math.max(0, days.indexOf(todayIso));
  const [i, setI] = useState(initial === -1 ? 0 : initial);
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [media, setMedia] = useState<DiaryMedia[]>([]);
  const [busy, setBusy] = useState(false);
  const [flip, setFlip] = useState<'next' | 'prev' | null>(null);
  const [tab, setTab] = useState<'morning' | 'evening'>('morning');

  const day = days[i];
  const cityName = cities?.find((c) => c.id === city);
  const save = useAutosave(day ?? todayIso, () => void reload());

  const reload = useCallback(async () => {
    if (!day) return;
    const e = await getEntry(day);
    setEntry(e ?? null);
    setMedia(e ? await mediaFor(e.id) : []);
  }, [day]);

  useEffect(() => { void reload(); }, [reload]);

  // The morning quests are generated once per page and then cached forever.
  // A fresh day has no entry at all yet, so create one before asking.
  useEffect(() => {
    if (!day || entry?.prompts.length) return;
    const ctrl = new AbortController();
    let alive = true;
    setBusy(true);
    void (async () => {
      const tasks = await aiDayTasks({
        lang, city: cityName ? tr(cityName.name, lang) : 'Marrakesh',
        dayNumber: i + 1, totalDays: days.length,
      }, ctrl.signal);
      if (!alive) return;
      await upsertEntry(day, { prompts: tasks ?? fallbackTasks(lang, i + 1) });
      await reload();
      setBusy(false);
    })();
    return () => { alive = false; ctrl.abort(); };
  }, [day, entry?.prompts.length, lang, i, days.length]);

  const turn = (dir: 'next' | 'prev') => {
    const target = dir === 'next' ? i + 1 : i - 1;
    if (target < 0 || target >= days.length) return;
    sfx.pageTurn();
    setFlip(dir);
    window.setTimeout(() => { setI(target); setFlip(null); }, 320);
  };

  const ensureEntry = async () => (await getEntry(day)) ?? (await upsertEntry(day, {}));

  const askQuestions = async () => {
    const e = await ensureEntry();
    if (e.questions?.length) return;
    setBusy(true);
    const qs = await aiEveningQuestions({
      lang, city: cityName ? tr(cityName.name, lang) : '', planned: e.morningPlan,
    });
    await upsertEntry(day, { questions: qs ?? FALLBACK_QUESTIONS[lang] });
    await reload();
    setBusy(false);
  };

  const summarise = async () => {
    const e = await ensureEntry();
    const notes = [
      e.morningPlan,
      ...Object.values(e.answers ?? {}),
      e.eveningNote,
      ...media.map((m) => m.caption).filter(Boolean),
    ].filter(Boolean).join('\n');
    if (!notes.trim()) return;
    setBusy(true);
    const s = await aiReflect({ lang, notes });
    if (s) { await upsertEntry(day, { eveningNote: `${e.eveningNote ? `${e.eveningNote}\n\n` : ''}${s}` }); await reload(); }
    setBusy(false);
  };

  if (!departure || !ret) {
    return (
      <div className="card-flat stack" style={{ alignItems: 'center', gap: 'var(--s3)', padding: 'var(--s8)' }}>
        <Icon name="book" size={26} color="var(--muted)" />
        <span className="small muted">{t('home.noTrip')}</span>
      </div>
    );
  }
  if (!days.length || !day) return <Spinner />;

  const date = parseDate(day);
  const isToday = day === todayIso;
  const isFuture = day > todayIso;
  const itinDay = itinerary?.[i];
  const doneCount = entry?.prompts.filter((p) => p.done).length ?? 0;

  return (
    <div className="stack" style={{ gap: 'var(--s3)' }}>
      {/* page counter + turners */}
      <div className="row-between">
        <button className="btn btn-ghost" style={{ minWidth: 44, padding: 0 }}
          onClick={() => turn('prev')} disabled={i === 0} aria-label={t('common.back')}>
          <Icon name="chevron-left" size={14} />
        </button>
        <span className="stack" style={{ alignItems: 'center', gap: 0 }}>
          <span className="tiny muted">{t('diary.page')} {i + 1} {t('diary.of')} {days.length}</span>
          <span className="small" style={{ fontWeight: 800 }}>
            {fmtWeekday(date, lang)}, {fmtDate(date, lang)}
          </span>
        </span>
        <button className="btn btn-ghost" style={{ minWidth: 44, padding: 0 }}
          onClick={() => turn('next')} disabled={i === days.length - 1} aria-label={t('common.next')}>
          <Icon name="chevron-right" size={14} />
        </button>
      </div>

      <div className="book">
        <div
          className="page stack"
          style={{
            gap: 'var(--s4)', padding: 'var(--s5) var(--s4) var(--s6) 42px',
            minHeight: '52vh',
            animation: flip ? `page-flip-${flip} .32s cubic-bezier(.4,0,.2,1) forwards` : undefined,
          }}
        >
          <span className="page-lines" aria-hidden />
          <span className="page-spine" aria-hidden />
          <span className="page-holes" aria-hidden>{Array.from({ length: 7 }, (_, n) => <i key={n} />)}</span>

          <div className="row-between" style={{ position: 'relative' }}>
            <span className="badge badge-gold">
              <Icon name="calendar" size={10} />
              {isToday ? t('diary.today') : isFuture ? t('diary.future') : t('diary.past')}
            </span>
            {itinDay && <span className="tiny muted truncate" style={{ maxWidth: 150 }}>{tr(itinDay.title, lang)}</span>}
          </div>

          {/* morning / evening */}
          <div className="row" style={{ gap: 'var(--s2)', position: 'relative' }}>
            {(['morning', 'evening'] as const).map((k) => (
              <button key={k} className={`chip ${tab === k ? 'active' : ''}`}
                onClick={() => { setTab(k); if (k === 'evening') void askQuestions(); }}>
                <Icon name={k === 'morning' ? 'sun' : 'moon'} size={11} /> {t(`diary.${k}`)}
              </button>
            ))}
          </div>

          {tab === 'morning' ? (
            <div className="stack" style={{ gap: 'var(--s5)', position: 'relative' }}>
              <label className="stack" style={{ gap: 4 }}>
                <span className="tiny" style={{ fontWeight: 800, color: 'var(--gold-deep)' }}>{t('diary.plan')}</span>
                <textarea className="ink" rows={3} placeholder={t('diary.planPlaceholder')}
                  defaultValue={entry?.morningPlan ?? ''} key={`plan-${day}`}
                  onChange={(e) => save({ morningPlan: e.target.value })} />
              </label>

              <div className="stack" style={{ gap: 'var(--s3)' }}>
                <div className="row-between">
                  <span className="tiny" style={{ fontWeight: 800, color: 'var(--gold-deep)' }}>
                    {t('diary.tasks')} {doneCount > 0 && `· ${doneCount}/${entry?.prompts.length}`}
                  </span>
                  {busy && <Icon name="spinner" size={12} spin color="var(--gold)" />}
                </div>
                {entry?.prompts.length ? entry.prompts.map((p, n) => (
                  <button key={n} className="row" style={{
                    gap: 'var(--s3)', textAlign: 'left', background: 'none', border: 0,
                    padding: 0, cursor: 'pointer', alignItems: 'flex-start',
                  }} data-sound="off"
                    onClick={() => { sfx.check(); void setTaskDone(day, n, !p.done).then(reload); }}>
                    <span style={{
                      flex: '0 0 24px', width: 24, height: 24, borderRadius: 7, marginTop: 1,
                      background: p.done ? 'var(--gold)' : 'transparent',
                      border: `2px solid ${p.done ? 'var(--gold)' : 'var(--line)'}`,
                      display: 'grid', placeItems: 'center',
                    }}>
                      {p.done && <Icon name="check" size={11} color="var(--on-gold)" />}
                    </span>
                    <span className="grow small" style={{
                      lineHeight: 1.45,
                      textDecoration: p.done ? 'line-through' : 'none',
                      color: p.done ? 'var(--muted)' : 'var(--ink)',
                    }}>
                      <Icon name={p.icon} size={12} color="var(--red)" /> {p.text}
                    </span>
                  </button>
                )) : (
                  <span className="tiny muted">{navigator.onLine ? t('common.loading') : t('diary.offlineAi')}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="stack" style={{ gap: 'var(--s5)', position: 'relative' }}>
              <div className="stack" style={{ gap: 'var(--s2)' }}>
                <span className="tiny" style={{ fontWeight: 800, color: 'var(--gold-deep)' }}>{t('diary.mood')}</span>
                <div className="row" style={{ gap: 'var(--s2)' }}>
                  {MOODS.map((face, n) => (
                    <button key={face} onClick={() => { sfx.tick(); save({ mood: n + 1 }); }} data-sound="off"
                      aria-label={`mood ${n + 1}`}
                      style={{
                        fontSize: 22, lineHeight: 1, padding: '6px 8px', cursor: 'pointer',
                        borderRadius: 10, background: entry?.mood === n + 1 ? 'var(--gold-soft)' : 'transparent',
                        border: `1px solid ${entry?.mood === n + 1 ? 'var(--gold)' : 'transparent'}`,
                        filter: entry?.mood && entry.mood !== n + 1 ? 'grayscale(1) opacity(.45)' : undefined,
                      }}>{face}</button>
                  ))}
                </div>
              </div>

              {entry?.questions?.map((q, n) => (
                <label key={n} className="stack" style={{ gap: 4 }}>
                  <span className="tiny" style={{ fontWeight: 700, color: 'var(--gold-deep)' }}>{q}</span>
                  <textarea className="ink" rows={2} key={`q-${day}-${n}`}
                    defaultValue={entry.answers?.[String(n)] ?? ''}
                    onChange={(e) => save({ answers: { ...entry.answers, [String(n)]: e.target.value } })} />
                </label>
              ))}

              <label className="stack" style={{ gap: 4 }}>
                <span className="tiny" style={{ fontWeight: 800, color: 'var(--gold-deep)' }}>{t('diary.summary')}</span>
                <textarea className="ink" rows={4} key={`sum-${day}`}
                  defaultValue={entry?.eveningNote ?? ''}
                  onChange={(e) => save({ eveningNote: e.target.value })} />
              </label>

              <button className="chip" style={{ alignSelf: 'flex-start' }}
                onClick={() => void summarise()} disabled={busy || !navigator.onLine}>
                <Icon name={busy ? 'spinner' : 'magic'} size={11} spin={busy} /> {t('diary.summarize')}
              </button>
            </div>
          )}

          <hr className="divider" style={{ position: 'relative' }} />

          <div className="stack" style={{ gap: 'var(--s4)', position: 'relative' }}>
            <Capture entryId={entry?.id ?? ''} onAdded={() => void reload()}
              ensureEntry={ensureEntry} />
            <MediaStrip items={media} onChange={() => void reload()} />
          </div>
        </div>
      </div>

    </div>
  );
}
