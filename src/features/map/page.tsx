import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { fetchRoute, type RouteResult } from '@/shared/lib/osrm';
import { fmtDistance, fmtDuration } from '@/shared/lib/haversine';
import { getPosition } from '@/shared/lib/geo';
import type { POI, POICat, WalkRoute } from '@/shared/model/types';

/**
 * Inline SVG markers instead of Leaflet's CDN PNGs — those were loaded from
 * unpkg and simply vanished offline.
 */
const pin = (fill: string, glyph = '') => L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 39C15 39 28 24.5 28 14.5A13 13 0 1 0 2 14.5C2 24.5 15 39 15 39Z"
      fill="${fill}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
    <circle cx="15" cy="14.5" r="5.5" fill="#fff"/>
    ${glyph}
  </svg>`,
  iconSize: [30, 40], iconAnchor: [15, 39], popupAnchor: [0, -34],
});

const ICONS = {
  poi: pin('#C1272D'),
  home: pin('#E3B341', '<circle cx="15" cy="14.5" r="2.6" fill="#8A6D1D"/>'),
  me: L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#2D7FF9;border:3px solid #fff;box-shadow:0 0 0 4px rgba(45,127,249,.25)"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9],
  }),
};

const LAYERS: { cat: POICat | 'all' | 'warn'; icon: IconName }[] = [
  { cat: 'all', icon: 'pin' }, { cat: 'sight', icon: 'museum' }, { cat: 'food', icon: 'food' },
  { cat: 'shop', icon: 'bag' }, { cat: 'market', icon: 'cart' }, { cat: 'pharmacy', icon: 'pills' },
  { cat: 'exchange', icon: 'money' }, { cat: 'transport', icon: 'train' }, { cat: 'warn', icon: 'warn' },
];

function Recenter({ lat, lon, zoom }: { lat: number; lon: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], zoom ?? map.getZoom()); }, [lat, lon, zoom, map]);
  return null;
}

function RouteSheet({ route, pois, onClose }: { route: WalkRoute; pois: Map<string, POI>; onClose: () => void }) {
  const { t, lang } = useT();
  const [calc, setCalc] = useState<RouteResult | null>(null);

  useEffect(() => {
    const coords = route.stops
      .map((s) => pois.get(s.poi))
      .filter((p): p is POI => !!p)
      .map((p) => [p.lon, p.lat] as [number, number]);
    if (coords.length < 2) return;
    let alive = true;
    void fetchRoute(coords).then((r) => { if (alive) setCalc(r); });
    return () => { alive = false; };
  }, [route, pois]);

  const dwell = route.stops.reduce((n, s) => n + s.dwell, 0);

  return (
    <div className="card stack fade-up" style={{ gap: 'var(--s3)' }}>
      <div className="row-between">
        <h3 className="row" style={{ gap: 8 }}>
          <Icon name={route.icon} size={14} color="var(--gold-deep)" /> {tr(route.title, lang)}
        </h3>
        <button className="btn btn-ghost" style={{ minWidth: 36, minHeight: 36, padding: 0 }} onClick={onClose}>
          <Icon name="x" size={12} />
        </button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>{tr(route.desc, lang)}</p>
      <div className="wrap">
        <span className="badge badge-gold">{route.stops.length} {t('map.stops')}</span>
        {calc && <span className="badge">{fmtDistance(calc.distance)}</span>}
        {calc && <span className="badge">{fmtDuration(calc.duration + dwell * 60)}</span>}
        {calc?.estimated && <span className="badge badge-warn"><Icon name="wifi" size={9} /> {t('map.estimate')}</span>}
      </div>
      <div className="dashed-gold stack" style={{ gap: 'var(--s3)' }}>
        {route.stops.map((s, i) => {
          const p = pois.get(s.poi);
          if (!p) return null;
          return (
            <div key={`${s.poi}-${i}`} style={{ position: 'relative' }}>
              <span className="timeline-pin" aria-hidden />
              <div className="row-between">
                <span style={{ fontWeight: 700, fontSize: 14 }}>{tr(p.name, lang)}</span>
                <span className="tiny muted num">{s.dwell} {t('common.min')}</span>
              </div>
              {s.note && <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{tr(s.note, lang)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MapPage() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const stay = useStore((s) => s.stays[city]);
  const { data: pois } = useData('poi');
  const { data: cities } = useData('cities');
  const { data: zones } = useData('safety');
  const { data: routes } = useData('routes');
  const [params] = useSearchParams();

  const [layer, setLayer] = useState<POICat | 'all' | 'warn'>('all');
  const [me, setMe] = useState<[number, number] | null>(null);
  const [openRoute, setOpenRoute] = useState<WalkRoute | null>(null);
  const [line, setLine] = useState<[number, number][]>([]);

  const cityData = useMemo(() => (cities ?? []).find((c) => c.id === city), [cities, city]);
  const poiMap = useMemo(() => new Map((pois ?? []).map((p) => [p.id, p])), [pois]);
  const focusId = params.get('poi');
  const focus = focusId ? poiMap.get(focusId) : null;

  const cityPois = useMemo(
    () => (pois ?? []).filter((p) => p.city === city && (layer === 'all' || layer === 'warn' || p.cat === layer)),
    [pois, city, layer],
  );
  const cityZones = useMemo(
    () => (zones ?? []).filter((z) => z.city === city && z.lat && z.lon && z.radiusM),
    [zones, city],
  );
  const cityRoutes = useMemo(() => (routes ?? []).filter((r) => r.city === city), [routes, city]);

  useEffect(() => {
    if (!openRoute) { setLine([]); return; }
    const coords = openRoute.stops
      .map((s) => poiMap.get(s.poi))
      .filter((p): p is POI => !!p)
      .map((p) => [p.lon, p.lat] as [number, number]);
    if (coords.length < 2) return;
    let alive = true;
    void fetchRoute(coords).then((r) => { if (alive) setLine(r.geometry); });
    return () => { alive = false; };
  }, [openRoute, poiMap]);

  const locate = async () => {
    try {
      const p = await getPosition();
      setMe([p.coords.latitude, p.coords.longitude]);
    } catch { /* denied or unavailable */ }
  };

  if (!cityData) return <Spinner label={t('common.loading')} />;
  const center: [number, number] = focus ? [focus.lat, focus.lon] : me ?? cityData.center;

  return (
    <div className="stack" style={{ gap: 'var(--s3)' }}>
      <div style={{
        borderRadius: 'var(--r-card)', overflow: 'hidden', border: '1px solid var(--line)',
        height: '52vh', minHeight: 320, position: 'relative', zIndex: 'var(--z-map)',
      }}>
        <MapContainer center={center} zoom={focus ? 16 : 13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
          <Recenter lat={center[0]} lon={center[1]} zoom={focus ? 16 : undefined} />

          {cityPois.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={ICONS.poi}>
              <Popup>
                <b>{tr(p.name, lang)}</b>
                {p.desc && <><br />{tr(p.desc, lang)}</>}
                {p.coordsApprox && <><br /><i>{t('places.coordsApprox')}</i></>}
              </Popup>
            </Marker>
          ))}

          {(layer === 'all' || layer === 'warn') && cityZones.map((z) => (
            <Circle key={z.id} center={[z.lat!, z.lon!]} radius={z.radiusM!}
              pathOptions={{
                color: z.level === 'avoid' ? '#B3261E' : '#B7791F',
                fillColor: z.level === 'avoid' ? '#B3261E' : '#B7791F',
                fillOpacity: 0.12, weight: 2, dashArray: '6 6',
              }}>
              <Popup><b>{tr(z.title, lang)}</b><br />{tr(z.why, lang)}</Popup>
            </Circle>
          ))}

          {stay?.lat && stay.lon && (
            <Marker position={[stay.lat, stay.lon]} icon={ICONS.home}>
              <Popup><b>{stay.name}</b><br />{stay.address}</Popup>
            </Marker>
          )}

          {me && <Marker position={me} icon={ICONS.me} />}
          {line.length > 1 && <Polyline positions={line} pathOptions={{ color: '#E3B341', weight: 4, dashArray: '2 8', lineCap: 'round' }} />}
        </MapContainer>

        <button className="btn" onClick={() => void locate()}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 500, minWidth: 44, padding: 0 }}
          aria-label={t('map.myLocation')}>
          <Icon name="locate" size={15} />
        </button>
      </div>

      <div className="scroll-x">
        {LAYERS.map((l) => (
          <button key={l.cat} className={`chip ${layer === l.cat ? 'active' : ''}`} onClick={() => setLayer(l.cat)}>
            <Icon name={l.icon} size={11} />
            {l.cat === 'warn' ? t('safety.kinds.zone') : t(`places.cats.${l.cat}` as const)}
          </button>
        ))}
      </div>

      {!navigator.onLine && (
        <div className="card-flat row tiny muted" style={{ gap: 8, padding: 'var(--s3)' }}>
          <Icon name="wifi" size={12} /> <span className="grow">{t('map.offlineNote')}</span>
        </div>
      )}

      {openRoute
        ? <RouteSheet route={openRoute} pois={poiMap} onClose={() => setOpenRoute(null)} />
        : cityRoutes.length > 0 && (
          <div className="stack" style={{ gap: 'var(--s2)' }}>
            <h2 style={{ fontSize: 18 }}>{t('map.routes')}</h2>
            {cityRoutes.map((r) => (
              <button key={r.id} className="card row" onClick={() => setOpenRoute(r)}
                style={{ gap: 'var(--s3)', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                <span style={{
                  flex: '0 0 40px', width: 40, height: 40, borderRadius: 'var(--r-ctl)',
                  background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
                }}>
                  <Icon name={r.icon} size={16} color="var(--gold-deep)" />
                </span>
                <span className="grow" style={{ minWidth: 0 }}>
                  <span className="row" style={{ gap: 6 }}>
                    <span style={{ fontWeight: 800 }}>{tr(r.title, lang)}</span>
                    <span className="badge">{r.kind === 'short' ? t('places.cats.all') : t('map.routes')}</span>
                  </span>
                  <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>
                    {r.stops.length} {t('map.stops')}
                  </span>
                </span>
                <Icon name="chevron-right" size={12} color="var(--muted)" />
              </button>
            ))}
          </div>
        )}

      <p className="tiny faint" style={{ margin: 0 }}>{t('map.attribution')}</p>
    </div>
  );
}
