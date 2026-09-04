import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, resolveTheme } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { Section } from '@/shared/ui/Section';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { countdown, fmtDate, parseDate, todayMidnight, tripPosition, addDays } from '@/shared/lib/trip';
import { haversine, fmtDistance } from '@/shared/lib/haversine';
import { getPosition } from '@/shared/lib/geo';

function HeroVideo() {
  const theme = useStore((s) => s.theme);
  const [play, setPlay] = useState(false);
  const resolved = resolveTheme(theme);

  useEffect(() => {
    // Respect reduced motion and metered connections — the clips are ~3 MB each.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setPlay(!reduce && !conn?.saveData && navigator.onLine);
  }, []);

  const poster = resolved === 'dark' ? '/illustrations/hero-night.webp' : '/illustrations/hero-day.webp';
  return (
    <div style={{
      position: 'relative', borderRadius: 'var(--r-card)', overflow: 'hidden',
      border: '1px solid var(--line)', aspectRatio: '16/9', background: 'var(--surface-2)',
    }}>
      {play ? (
        <video
          key={resolved}
          src={resolved === 'dark' ? '/media/hero-night.mp4' : '/media/hero-day.mp4'}
          poster={poster}
          autoPlay muted loop playsInline preload="none"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img src={poster} alt="" width={1200} height={669} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </div>
  );
}

function Countdown({ departure }: { departure: string }) {
  const { t, lang } = useT();
  const [c, setC] = useState(() => countdown(departure));
  const prev = useRef(c.days);

  useEffect(() => {
    const id = setInterval(() => setC(countdown(departure)), 1000);
    return () => clearInterval(id);
  }, [departure]);

  useEffect(() => { prev.current = c.days; }, [c.days]);

  const units: [number, string][] = [
    [c.days, t('home.days')], [c.hours, t('home.hoursShort')],
    [c.minutes, t('home.minutes')], [c.seconds, t('home.seconds')],
  ];

  return (
    <div className="card zellige stack" style={{ gap: 'var(--s3)' }}>
      <div className="row-between">
        <span className="small muted" style={{ fontWeight: 700 }}>
          {c.past ? t('home.started') : t('home.until')}
        </span>
        <span className="badge badge-gold">
          <Icon name="calendar" size={10} /> {fmtDate(parseDate(departure), lang)}
        </span>
      </div>
      <div className="row" style={{ gap: 'var(--s4)' }}>
        {units.map(([n, label], i) => (
          <div key={label} className="stack" style={{ gap: 0, alignItems: 'center' }}>
            <span className="num" style={{
              fontSize: i === 0 ? 40 : 28, fontWeight: 800, lineHeight: 1,
              color: i === 0 ? 'var(--red)' : 'var(--ink)',
            }}>
              {String(n).padStart(2, '0')}
            </span>
            <span className="tiny muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyStay() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const stay = useStore((s) => s.stays[city]);
  const [dist, setDist] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!stay?.lat || !stay.lon) return;
    let alive = true;
    getPosition(6000)
      .then((p) => { if (alive) setDist(haversine(p.coords.latitude, p.coords.longitude, stay.lat!, stay.lon!)); })
      .catch(() => { /* no location, no distance — the address still works */ });
    return () => { alive = false; };
  }, [stay?.lat, stay?.lon]);

  const copy = async () => {
    if (!stay) return;
    try { await navigator.clipboard.writeText(`${stay.name}\n${stay.address}`); } catch { /* denied */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!stay) {
    return (
      <Link to="/settings" className="card row" style={{ gap: 'var(--s3)', textDecoration: 'none' }}>
        <Icon name="bed" size={20} color="var(--muted)" />
        <span className="grow small muted">{t('home.noHome')}</span>
        <span className="chip">{t('home.addHome')}</span>
      </Link>
    );
  }

  return (
    <div className="card stack" style={{ gap: 'var(--s3)', borderColor: 'var(--gold)' }}>
      <div className="row-between">
        <span className="row small" style={{ gap: 8, fontWeight: 800 }}>
          <Icon name="house" size={14} color="var(--gold-deep)" /> {t('home.myHome')}
        </span>
        {dist !== null && <span className="badge badge-gold">{fmtDistance(dist)}</span>}
      </div>
      <div className="stack" style={{ gap: 2 }}>
        <span style={{ fontWeight: 700 }}>{stay.name}</span>
        <span className="tiny muted">{stay.address}</span>
      </div>
      <div className="row" style={{ gap: 'var(--s2)' }}>
        <button className="btn btn-gold grow" onClick={() => void copy()}>
          <Icon name={copied ? 'check' : 'copy'} size={13} />
          {copied ? t('common.copied') : t('home.takeMeHome')}
        </button>
        {stay.lat && (
          <Link className="btn" to="/map" aria-label={t('common.onMap')}>
            <Icon name="map" size={14} />
          </Link>
        )}
      </div>
      <span className="tiny faint">{t('home.addressForDriver')} · {tr({ uk: 'покажи екран водієві', en: 'show this screen to the driver' }, lang)}</span>
    </div>
  );
}

function Rates() {
  const { t } = useT();
  const rates = useStore((s) => s.rates);
  const rows: [string, number, string][] = [
    ['🇺🇦 UAH', rates.uah, '₴'], ['🇲🇩 MDL', rates.mdl, 'L'], ['🇲🇦 MAD', rates.mad, 'د.م'],
  ];
  return (
    <div className="card stack" style={{ gap: 'var(--s3)' }}>
      <div className="row-between">
        <span className="row small" style={{ gap: 8, fontWeight: 800 }}>
          <Icon name="money" size={14} color="var(--gold-deep)" /> {t('home.rates')}
        </span>
        <Link to="/settings" className="tiny muted" style={{ textDecoration: 'none' }}>
          {t('common.edit')} <Icon name="chevron-right" size={9} />
        </Link>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        {rows.map(([label, v, sym]) => (
          <div key={label} className="stack" style={{ gap: 0, alignItems: 'center' }}>
            <span className="num" style={{ fontSize: 19, fontWeight: 700 }}>{v}</span>
            <span className="tiny muted">{label} {sym}</span>
          </div>
        ))}
      </div>
      <span className="tiny faint">{t('home.ratesNote')}</span>
    </div>
  );
}

const QUICK = [
  { to: '/sos', icon: 'shield-half', label: 'SOS', tone: 'red' },
  { to: '/checklist', icon: 'o-check', label: 'nav.checklist' },
  { to: '/map', icon: 'map', label: 'map.title' },
  { to: '/phrases', icon: 'comment', label: 'phrases.title' },
] as const;

export default function HomePage() {
  const { t, lang } = useT();
  const departure = useStore((s) => s.departure);
  const ret = useStore((s) => s.ret);
  const { data: days } = useData('itinerary');
  const { data: safety } = useData('safety');

  const pos = tripPosition(departure, ret, days?.length ?? 6);
  const today = pos.dayIndex !== null && days ? days[pos.dayIndex] : null;

  // Rotate the tip by day so it changes daily but never mid-session.
  const tip = useMemo(() => {
    const tips = (safety ?? []).flatMap((s) => s.tips);
    if (!tips.length) return null;
    const today = todayMidnight().getTime();
    return tips[Math.floor(today / 86_400_000) % tips.length];
  }, [safety]);

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }} data-stagger>
      <HeroVideo />
      {departure && <Countdown departure={departure} />}

      {today && departure && (
        <Section icon="calendar" title={t('home.todayCard')}
          action={<Link to="/itinerary" className="chip">{t('common.more')}</Link>}>
          <Link to="/itinerary" className="card stack" style={{ gap: 'var(--s3)', textDecoration: 'none' }}>
            <div className="row-between">
              <span className="badge badge-red">
                {t('home.dayN', { n: (pos.dayIndex ?? 0) + 1 })}
              </span>
              <span className="tiny muted">
                {fmtDate(addDays(departure, pos.dayIndex ?? 0), lang)}
              </span>
            </div>
            <h3>{tr(today.title, lang)}</h3>
            {today.summary && <p className="small muted" style={{ margin: 0 }}>{tr(today.summary, lang)}</p>}
            <div className="stack dashed-gold" style={{ gap: 6, marginTop: 4 }}>
              {today.blocks.slice(0, 3).map((b) => (
                <div key={b.t} className="row small" style={{ gap: 10 }}>
                  <span className="num tiny muted" style={{ minWidth: 38 }}>{b.t}</span>
                  <span className="grow truncate">{tr(b.title, lang)}</span>
                </div>
              ))}
            </div>
          </Link>
        </Section>
      )}

      {pos.before && departure && (
        <div className="card-flat row" style={{ gap: 'var(--s3)' }}>
          <Icon name="luggage" size={20} color="var(--gold-deep)" />
          <span className="grow small">
            <b>{t('home.beforeTrip')}</b> — {t('check.title').toLowerCase()}
          </span>
          <Link to="/checklist" className="chip gold">{t('common.show')}</Link>
        </div>
      )}

      <Section icon="bolt" title={t('home.quick')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s2)' }}>
          {QUICK.map((q) => (
            <Link key={q.to} to={q.to} className="stack" style={{
              alignItems: 'center', gap: 6, padding: 'var(--s3) 4px', textDecoration: 'none',
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 'var(--r-card)', minHeight: 76, justifyContent: 'center',
            }}>
              <Icon name={q.icon} size={18} color={'tone' in q ? 'var(--red)' : 'var(--gold-deep)'} />
              <span className="tiny" style={{ fontWeight: 700, textAlign: 'center' }}>
                {q.label === 'SOS' ? 'SOS' : t(q.label)}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <MyStay />
      <Rates />

      {tip && (
        <div className="card-flat stack" style={{ gap: 6 }}>
          <span className="row tiny" style={{ gap: 8, fontWeight: 800, color: 'var(--gold-deep)' }}>
            <Icon name="tip" size={12} /> {t('home.tip')}
          </span>
          <span className="small">{tr(tip, lang)}</span>
        </div>
      )}
    </div>
  );
}
