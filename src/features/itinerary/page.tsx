import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { addDays, fmtDate, fmtWeekday, tripPosition } from '@/shared/lib/trip';
import { useMotion } from '@/shared/lib/usePageEnter';
import type { BlockType } from '@/shared/model/types';

const BLOCK_ICON: Record<BlockType, IconName> = {
  move: 'plane', sight: 'museum', food: 'food', stay: 'bed',
  shop: 'bag', rest: 'cafe', tour: 'mountain',
};

export default function ItineraryPage() {
  const { t, lang } = useT();
  const departure = useStore((s) => s.departure);
  const ret = useStore((s) => s.ret);
  const { data: days, loading } = useData('itinerary');
  const [sel, setSel] = useState<number | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const pos = tripPosition(departure, ret, days?.length ?? 6);
  const active = sel ?? pos.dayIndex ?? 0;

  // Scroll the current day's chip into view on first paint.
  useEffect(() => {
    if (!days) return;
    chipsRef.current?.children[active]?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [days, active]);

  // Redrawn whenever the selected day changes.
  useMotion(timelineRef, 'drawTimeline', [active, days]);

  if (loading || !days) return <Spinner label={t('common.loading')} />;
  const day = days[active];

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('itin.title')} />

      <div className="scroll-x" ref={chipsRef}>
        {days.map((d, i) => {
          const date = departure ? addDays(departure, i) : null;
          const isToday = pos.dayIndex === i;
          return (
            <button key={d.id} className={`chip ${i === active ? 'active' : ''}`} onClick={() => setSel(i)}
              style={{ flexDirection: 'column', gap: 1, minHeight: 52, paddingTop: 6, paddingBottom: 6 }}>
              <span style={{ fontSize: 13 }}>
                {t('itin.day')} {i + 1}
                {isToday && <span style={{ color: i === active ? 'var(--gold)' : 'var(--red)' }}> ·</span>}
              </span>
              {date && (
                <span className="tiny" style={{ opacity: .75, fontWeight: 600 }}>
                  {fmtDate(date, lang, { day: 'numeric', month: 'short' })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="stack fade-up" key={day.id} ref={timelineRef} style={{ gap: 'var(--s4)' }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="row" style={{ gap: 'var(--s2)' }}>
            {departure && (
              <span className="badge badge-gold">
                <Icon name="calendar" size={10} />
                {fmtWeekday(addDays(departure, active), lang)}, {fmtDate(addDays(departure, active), lang)}
              </span>
            )}
            {pos.dayIndex === active && <span className="badge badge-red">{t('common.today')}</span>}
          </div>
          <h2>{tr(day.title, lang)}</h2>
          {day.summary && <p className="small muted" style={{ margin: 0 }}>{tr(day.summary, lang)}</p>}
        </div>

        <div className="dashed-gold stack" data-stagger style={{ gap: 'var(--s3)', position: 'relative' }}>
          {day.blocks.map((b, i) => (
            <div key={`${b.t}-${i}`} className="card stack" style={{ gap: 8, position: 'relative' }}>
              <span className="timeline-pin" aria-hidden />
              <div className="row-between">
                <span className="row" style={{ gap: 8 }}>
                  <span className="num small" style={{ fontWeight: 800, color: 'var(--red)' }}>{b.t}</span>
                  <span className="badge badge-gold">
                    <Icon name={BLOCK_ICON[b.type]} size={10} /> {t(`itin.types.${b.type}` as const)}
                  </span>
                </span>
                {b.cost && <span className="tiny muted">{tr(b.cost, lang)}</span>}
              </div>
              <span style={{ fontWeight: 700, lineHeight: 1.35 }}>{tr(b.title, lang)}</span>
              {b.detail && <span className="small muted">{tr(b.detail, lang)}</span>}
              {b.poi && (
                <Link to={`/map?poi=${b.poi}`} className="chip" style={{ alignSelf: 'flex-start' }}>
                  <Icon name="map" size={11} /> {t('common.onMap')}
                </Link>
              )}
            </div>
          ))}
        </div>

        {day.stay && (
          <div className="card-flat row" style={{ gap: 'var(--s3)' }}>
            <Icon name="bed" size={17} color="var(--gold-deep)" />
            <span className="grow small"><b>{t('itin.stay')}</b> — {day.stay}</span>
          </div>
        )}
      </div>
    </div>
  );
}
