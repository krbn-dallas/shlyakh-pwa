import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Section } from '@/shared/ui/Section';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import { token } from '@/shared/i18n/tokens';
import type { CityId, POI } from '@/shared/model/types';

const COUNTRY_OF: Record<CityId, string> = {
  kyiv: 'ua', chisinau: 'md',
  marrakech: 'ma', casablanca: 'ma', fes: 'ma', rabat: 'ma',
  tangier: 'ma', agadir: 'ma', essaouira: 'ma', ouarzazate: 'ma',
};
const MOROCCO = new Set(Object.entries(COUNTRY_OF).filter(([, c]) => c === 'ma').map(([k]) => k));

function PoiRow({ p }: { p: POI }) {
  const { lang } = useT();
  return (
    <div className="row" style={{ gap: 'var(--s3)', alignItems: 'flex-start', padding: 'var(--s2) 0' }}>
      <Icon name={p.cat === 'pharmacy' ? 'pills' : 'money'} size={14} color="var(--gold-deep)" />
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{tr(p.name, lang)}</span>
          {p.tags?.includes('24/7') && <span className="badge badge-ok">24/7</span>}
        </div>
        {p.desc && <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{tr(p.desc, lang)}</span>}
        {p.hours && <span className="tiny faint" style={{ display: 'block' }}>{token(p.hours, lang)}</span>}
        {p.price && <span className="tiny" style={{ display: 'block', color: 'var(--gold-deep)' }}>{tr(p.price, lang)}</span>}
      </div>
      <Link className="chip" to={`/map?poi=${p.id}`} aria-label="map"><Icon name="map" size={11} /></Link>
    </div>
  );
}

export default function ServicesPage() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const { data: taxi, loading: l1 } = useData('taxi');
  const { data: poi, loading: l2 } = useData('poi');
  const { data: transport } = useData('transport');
  const [allMorocco, setAllMorocco] = useState(false);

  const country = COUNTRY_OF[city];
  const isMa = country === 'ma';
  const wide = allMorocco && isMa;
  const scope = useCallback(
    (c: string) => (wide ? MOROCCO.has(c) : c === city),
    [wide, city],
  );

  const taxiList = useMemo(() => (taxi ?? []).filter((x) => scope(x.city)), [taxi, scope]);
  const pharmacies = useMemo(() => (poi ?? []).filter((p) => p.cat === 'pharmacy' && scope(p.city)), [poi, scope]);
  const exchanges = useMemo(() => (poi ?? []).filter((p) => (p.cat === 'exchange' || p.cat === 'money') && scope(p.city)), [poi, scope]);
  const transportList = useMemo(
    () => (transport ?? []).filter((x) => x.scope === city || x.scope === country),
    [transport, city, country],
  );

  if (l1 || l2) return <Spinner label={t('common.loading')} />;

  return (
    <div className="stack" style={{ gap: 'var(--s6)' }}>
      <PageHeader title={t('services.title')} />

      {isMa && (
        <div className="row" style={{ gap: 'var(--s2)' }}>
          <button className={`chip ${!allMorocco ? 'active' : ''}`} onClick={() => setAllMorocco(false)}>
            <Icon name="pin" size={11} /> {t('places.scopeCity')}
          </button>
          <button className={`chip ${allMorocco ? 'active' : ''}`} onClick={() => setAllMorocco(true)}>
            <Icon name="africa" size={11} /> {t('places.scopeAll')}
          </button>
        </div>
      )}

      <Section icon="taxi" title={t('services.taxi')}
        note={isMa ? t('services.taxiWarn') : undefined}>
        <div className="stack" style={{ gap: 'var(--s2)' }}>
          {taxiList.map((x) => {
            const isPhone = x.kind === 'phone';
            const href = isPhone ? `tel:${x.value}` : x.value;
            return (
              <a key={x.id} href={href} target={isPhone ? undefined : '_blank'} rel="noreferrer"
                className="card stack" style={{ gap: 6, textDecoration: 'none' }}>
                <div className="row" style={{ gap: 'var(--s3)' }}>
                  <Icon name={isPhone ? 'phone' : 'phone_app'} size={16} color={isPhone ? 'var(--red)' : 'var(--gold-deep)'} />
                  <span className="grow" style={{ fontWeight: 800 }}>{x.name}</span>
                  {isPhone
                    ? <span className="num" style={{ fontWeight: 800, color: 'var(--red)' }}>{x.value}</span>
                    : <Icon name="external" size={12} color="var(--muted)" />}
                </div>
                {x.note && <span className="small muted">{tr(x.note, lang)}</span>}
                {x.warn && (
                  <span className="row tiny" style={{ gap: 6, color: 'var(--warn)' }}>
                    <Icon name="warn" size={11} /> <span className="grow">{tr(x.warn, lang)}</span>
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </Section>

      {transportList.length > 0 && (
        <Section icon="train" title={t('services.intercity')}>
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            {transportList.map((x) => (
              <div key={x.id} className="card stack" style={{ gap: 'var(--s3)' }}>
                <div className="row" style={{ gap: 'var(--s3)' }}>
                  <Icon name={x.icon} size={17} color="var(--gold-deep)" />
                  <span className="grow" style={{ fontWeight: 800 }}>{tr(x.title, lang)}</span>
                </div>
                <p className="small muted" style={{ margin: 0 }}>{tr(x.desc, lang)}</p>
                <ul className="stack" style={{ gap: 6, margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {x.facts.map((f, i) => (
                    <li key={i} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}>
                      <Icon name="check" size={11} color="var(--ok)" />
                      <span className="grow">{tr(f, lang)}</span>
                    </li>
                  ))}
                </ul>
                <div className="row" style={{ gap: 'var(--s2)' }}>
                  {x.url && <a className="chip" href={x.url} target="_blank" rel="noreferrer">
                    <Icon name="external" size={11} /> {t('services.openApp')}
                  </a>}
                  {x.tel && <a className="chip" href={`tel:${x.tel}`}>
                    <Icon name="phone" size={11} /> {t('services.dial')}
                  </a>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section icon="pills" title={t('services.pharmacy')} note={isMa ? t('services.pharmacyNote') : undefined}>
        <div className="card stack" style={{ gap: 0 }}>
          {pharmacies.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <hr className="divider" style={{ margin: 'var(--s2) 0' }} />}
              <PoiRow p={p} />
            </div>
          ))}
          {pharmacies.length === 0 && <span className="small muted">{t('common.nothingFound')}</span>}
        </div>
      </Section>

      <Section icon="money" title={t('services.exchange')} note={isMa ? t('services.exchangeNote') : undefined}>
        <div className="card stack" style={{ gap: 0 }}>
          {exchanges.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <hr className="divider" style={{ margin: 'var(--s2) 0' }} />}
              <PoiRow p={p} />
            </div>
          ))}
          {exchanges.length === 0 && <span className="small muted">{t('common.nothingFound')}</span>}
        </div>
      </Section>
    </div>
  );
}
