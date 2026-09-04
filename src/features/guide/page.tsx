import { useState } from 'react';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';

export default function GuidePage() {
  const { t, lang } = useT();
  const { data: guide, loading } = useData('guide');
  const [sec, setSec] = useState(0);

  if (loading || !guide) return <Spinner label={t('common.loading')} />;
  const s = guide[sec];

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('guide.title')} />

      <div className="scroll-x">
        {guide.map((g, i) => (
          <button key={g.id} className={`chip ${i === sec ? 'active' : ''}`} onClick={() => setSec(i)}>
            <Icon name={g.icon} size={11} /> {tr(g.title, lang)}
          </button>
        ))}
      </div>

      <div className="stack fade-up" key={s.id} style={{ gap: 'var(--s4)' }}>
        <div className="card-flat zellige stack" style={{ gap: 8 }}>
          <h2 className="row" style={{ gap: 'var(--s2)' }}>
            <Icon name={s.icon} size={16} color="var(--gold-deep)" /> {tr(s.title, lang)}
          </h2>
          <p className="small muted" style={{ margin: 0 }}>{tr(s.intro, lang)}</p>
        </div>

        {s.items.map((item, i) => (
          <div key={i} className="card stack" style={{ gap: 'var(--s3)' }}>
            <h3>{tr(item.title, lang)}</h3>
            <p className="small" style={{ margin: 0, lineHeight: 1.55 }}>{tr(item.body, lang)}</p>
            {item.tips && item.tips.length > 0 && (
              <ul className="stack" style={{ gap: 7, margin: 0, padding: 0, listStyle: 'none' }}>
                {item.tips.map((tip, k) => (
                  <li key={k} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}>
                    <Icon name="check" size={11} color="var(--ok)" />
                    <span className="grow muted">{tr(tip, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
