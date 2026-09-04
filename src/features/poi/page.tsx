import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { token } from '@/shared/i18n/tokens';
import { fmtDistance, haversine } from '@/shared/lib/haversine';
import { getPosition } from '@/shared/lib/geo';
import type { POI, POICat } from '@/shared/model/types';

const CAT_ICON: Record<POICat, IconName> = {
  sight: 'museum', food: 'food', shop: 'bag', market: 'cart', pharmacy: 'pills',
  exchange: 'money', transport: 'train', stay: 'bed', money: 'card',
  craft: 'kit', nature: 'mountain',
};

const CATS: (POICat | 'all')[] = [
  'all', 'sight', 'food', 'market', 'shop', 'craft', 'pharmacy', 'exchange',
  'transport', 'nature', 'stay', 'money',
];

const MOROCCO = new Set(['marrakech', 'casablanca', 'fes', 'rabat', 'tangier', 'agadir', 'essaouira', 'ouarzazate']);

function Card({ p, dist, warn, cityLabel }: { p: POI; dist: number | null; warn: boolean; cityLabel?: string }) {
  const { t, lang } = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = p.address ? `${tr(p.name, lang)}\n${p.address}` : tr(p.name, lang);
    try { await navigator.clipboard.writeText(text); } catch { /* denied */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card stack" style={{ gap: 'var(--s3)' }}>
      <div className="row" style={{ gap: 'var(--s3)', alignItems: 'flex-start' }}>
        <span style={{
          flex: '0 0 38px', width: 38, height: 38, borderRadius: 'var(--r-ctl)',
          background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
        }}>
          <Icon name={CAT_ICON[p.cat]} size={15} color="var(--gold-deep)" />
        </span>
        <span className="grow" style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontWeight: 800, lineHeight: 1.3 }}>{tr(p.name, lang)}</span>
          <span className="tiny muted">
            {t(`places.cats.${p.cat}` as const)}
            {cityLabel && ` · ${cityLabel}`}
            {p.hours && ` · ${token(p.hours, lang)}`}
          </span>
        </span>
        {dist !== null && <span className="badge badge-gold">{fmtDistance(dist)}</span>}
      </div>

      {p.desc && <p className="small muted" style={{ margin: 0 }}>{tr(p.desc, lang)}</p>}

      <div className="wrap">
        {p.price && <span className="badge badge-ok">{tr(p.price, lang)}</span>}
        {p.fixedPrice && <span className="badge badge-gold"><Icon name="scale" size={10} /> {t('places.fixedPrice')}</span>}
        {warn && <span className="badge badge-warn"><Icon name="warn" size={10} /> {t('places.nearWarn')}</span>}
        {p.coordsApprox && <span className="badge"><Icon name="pin" size={10} /> {t('places.coordsApprox')}</span>}
        {p.tags?.map((tag) => <span key={tag} className="badge">{token(tag, lang)}</span>)}
      </div>

      {p.address && <span className="tiny faint">{p.address}</span>}

      <div className="row" style={{ gap: 'var(--s2)' }}>
        <button className="chip grow" onClick={() => void copy()} title={t('places.copyHint')}>
          <Icon name={copied ? 'check' : 'copy'} size={11} />
          {copied ? t('common.copied') : t('places.copyAddress')}
        </button>
        <Link className="chip" to={`/map?poi=${p.id}`}><Icon name="map" size={11} /> {t('common.onMap')}</Link>
        {p.tel && <a className="chip" href={`tel:${p.tel}`}><Icon name="phone" size={11} /></a>}
      </div>
    </div>
  );
}

export default function PoiPage() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const { data: poi, loading } = useData('poi');
  const { data: cities } = useData('cities');
  const { data: safety } = useData('safety');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<POICat | 'all'>('all');
  const [allMorocco, setAllMorocco] = useState(false);
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let alive = true;
    getPosition(6000)
      .then((p) => { if (alive) setHere({ lat: p.coords.latitude, lon: p.coords.longitude }); })
      .catch(() => { /* no location — list is unsorted by distance, which is fine */ });
    return () => { alive = false; };
  }, []);

  const cityName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of cities ?? []) m.set(c.id, tr(c.name, lang));
    return m;
  }, [cities, lang]);

  const zones = useMemo(() => (safety ?? []).filter((s) => s.lat && s.lon && s.radiusM), [safety]);
  const isMoroccoCity = MOROCCO.has(city);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (poi ?? [])
      .filter((p) => (allMorocco && isMoroccoCity ? MOROCCO.has(p.city) : p.city === city))
      .filter((p) => cat === 'all' || p.cat === cat)
      .filter((p) => !needle
        || tr(p.name, lang).toLowerCase().includes(needle)
        || (p.desc && tr(p.desc, lang).toLowerCase().includes(needle))
        || p.tags?.some((tg) => tg.toLowerCase().includes(needle))
        || p.address?.toLowerCase().includes(needle))
      .map((p) => ({
        p,
        dist: here ? haversine(here.lat, here.lon, p.lat, p.lon) : null,
        warn: zones.some((z) => haversine(z.lat!, z.lon!, p.lat, p.lon) < (z.radiusM ?? 0)),
      }))
      .sort((a, b) => (a.dist !== null && b.dist !== null ? a.dist - b.dist : 0));
  }, [poi, city, cat, q, here, zones, lang, allMorocco, isMoroccoCity]);

  if (loading) return <Spinner label={t('common.loading')} />;

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('places.title')} />

      <div className="row" style={{ gap: 'var(--s2)' }}>
        <div className="grow" style={{ position: 'relative' }}>
          <input className="input" placeholder={t('common.search')} value={q}
            onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="search" size={13} color="var(--muted)" />
          </span>
        </div>
        {q && (
          <button className="btn btn-ghost" style={{ minWidth: 44, padding: 0 }} onClick={() => setQ('')} aria-label={t('common.close')}>
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {isMoroccoCity && (
        <div className="row" style={{ gap: 'var(--s2)' }}>
          <button className={`chip ${!allMorocco ? 'active' : ''}`} onClick={() => setAllMorocco(false)}>
            <Icon name="pin" size={11} /> {t('places.scopeCity')}
          </button>
          <button className={`chip ${allMorocco ? 'active' : ''}`} onClick={() => setAllMorocco(true)}>
            <Icon name="africa" size={11} /> {t('places.scopeAll')}
          </button>
        </div>
      )}

      <div className="scroll-x">
        {CATS.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c !== 'all' && <Icon name={CAT_ICON[c]} size={11} />}
            {t(`places.cats.${c}` as const)}
          </button>
        ))}
      </div>

      <span className="tiny muted">{list.length} {t('places.title').toLowerCase()}</span>

      <div className="stack" data-stagger style={{ gap: 'var(--s3)' }}>
        {list.map(({ p, dist, warn }) => (
          <Card key={p.id} p={p} dist={dist} warn={warn}
            cityLabel={allMorocco ? cityName.get(p.city) : undefined} />
        ))}
        {list.length === 0 && (
          <div className="card-flat stack" style={{ alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s8)' }}>
            <Icon name="search" size={22} color="var(--muted)" />
            <span className="small muted">{t('common.nothingFound')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
