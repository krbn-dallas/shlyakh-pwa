import { useMemo, useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import type { CityId, SafetyKind, SafetyLevel } from '@/shared/model/types';

const COUNTRY_OF: Record<CityId, string> = {
  kyiv: 'ua', chisinau: 'md',
  marrakech: 'ma', casablanca: 'ma', fes: 'ma', rabat: 'ma',
  tangier: 'ma', agadir: 'ma', essaouira: 'ma', ouarzazate: 'ma',
};

const KIND_ICON: Record<SafetyKind, IconName> = {
  zone: 'pin', scam: 'warn', rule: 'book', women: 'venus', health: 'kit', legal: 'scale',
};
const KINDS: (SafetyKind | 'all')[] = ['all', 'zone', 'scam', 'women', 'rule', 'health', 'legal'];

const LEVEL: Record<SafetyLevel, { color: string; badge: string }> = {
  info: { color: 'var(--line)', badge: 'badge' },
  caution: { color: 'var(--warn)', badge: 'badge badge-warn' },
  avoid: { color: 'var(--danger)', badge: 'badge badge-red' },
};

export default function SafetyPage() {
  const { t, lang } = useT();
  const city = useStore((s) => s.city);
  const { data: all, loading } = useData('safety');
  const { data: cities } = useData('cities');
  const [kind, setKind] = useState<SafetyKind | 'all'>('all');

  const cityName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of cities ?? []) m.set(c.id, tr(c.name, lang));
    return m;
  }, [cities, lang]);

  const list = useMemo(() => {
    const country = COUNTRY_OF[city];
    const order: Record<SafetyLevel, number> = { avoid: 0, caution: 1, info: 2 };
    return (all ?? [])
      .filter((s) => s.city === city || s.city === country || s.city === '*'
        // Morocco-wide advice stays relevant in any Moroccan city
        || (country === 'ma' && COUNTRY_OF[s.city as CityId] === 'ma'))
      .filter((s) => kind === 'all' || s.kind === kind)
      .sort((a, b) => order[a.level] - order[b.level]);
  }, [all, city, kind]);

  if (loading) return <Spinner label={t('common.loading')} />;

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('safety.title')} />

      <div className="row wrap" style={{ gap: 'var(--s2)' }}>
        {(Object.keys(LEVEL) as SafetyLevel[]).map((l) => (
          <span key={l} className={LEVEL[l].badge}>{t(`safety.levels.${l}` as const)}</span>
        ))}
      </div>

      <div className="scroll-x">
        {KINDS.map((k) => (
          <button key={k} className={`chip ${kind === k ? 'active' : ''}`} onClick={() => setKind(k)}>
            {k !== 'all' && <Icon name={KIND_ICON[k]} size={11} />}
            {t(`safety.kinds.${k}` as const)}
          </button>
        ))}
      </div>

      <div className="stack" data-stagger style={{ gap: 'var(--s3)' }}>
        {list.map((s) => (
          <div key={s.id} className="card stack"
            style={{ gap: 'var(--s3)', borderLeft: `4px solid ${LEVEL[s.level].color}` }}>
            <div className="row" style={{ gap: 'var(--s3)', alignItems: 'flex-start' }}>
              <Icon name={KIND_ICON[s.kind]} size={16} color={LEVEL[s.level].color} />
              <span className="grow" style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, lineHeight: 1.3 }}>{tr(s.title, lang)}</span>
                <span className="row" style={{ gap: 6, marginTop: 5 }}>
                  <span className={LEVEL[s.level].badge}>{t(`safety.levels.${s.level}` as const)}</span>
                  {cityName.get(s.city) && <span className="badge">{cityName.get(s.city)}</span>}
                </span>
              </span>
            </div>

            <div className="stack" style={{ gap: 4 }}>
              <span className="tiny" style={{ fontWeight: 800, color: 'var(--muted)' }}>{t('safety.why')}</span>
              <span className="small">{tr(s.why, lang)}</span>
            </div>

            {s.tips.length > 0 && (
              <div className="stack" style={{ gap: 6 }}>
                <span className="tiny" style={{ fontWeight: 800, color: 'var(--muted)' }}>{t('safety.what')}</span>
                <ul className="stack" style={{ gap: 6, margin: 0, padding: 0, listStyle: 'none' }}>
                  {s.tips.map((tip, i) => (
                    <li key={i} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}>
                      <Icon name="check" size={11} color="var(--ok)" />
                      <span className="grow">{tr(tip, lang)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="tiny faint" style={{ margin: 0 }}>
        <Icon name="info" size={11} /> {t('safety.disclaimer')}
      </p>
    </div>
  );
}
