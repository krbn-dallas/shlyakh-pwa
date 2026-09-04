import { useMemo, useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import type { Phrase, PhraseCat } from '@/shared/model/types';

const CATS: (PhraseCat | 'all' | 'fav')[] = [
  'all', 'fav', 'basics', 'polite', 'taxi', 'bargain', 'food', 'hotel',
  'directions', 'health', 'sos', 'women', 'family', 'numbers', 'time',
];

function Card({ p }: { p: Phrase }) {
  const { t, lang } = useT();
  const fav = useStore((s) => s.favPhrases.includes(p.id));
  const toggleFav = useStore((s) => s.toggleFav);
  const [shown, setShown] = useState(false);
  const source = lang === 'en' ? p.en : p.uk;

  if (shown) {
    // The "show them this" face: big Arabic and French, legible at arm's length.
    return (
      <button onClick={() => setShown(false)} className="card stack"
        style={{
          gap: 'var(--s4)', width: '100%', textAlign: 'center', cursor: 'pointer',
          background: 'var(--ink)', borderColor: 'var(--ink)', padding: 'var(--s6) var(--s4)',
        }}>
        <span className="ar" style={{ fontSize: 30, lineHeight: 1.6, color: 'var(--bg)', direction: 'rtl' }}>{p.ar}</span>
        <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--gold)' }}>{p.fr}</span>
        {p.ro && <span className="small" style={{ color: 'var(--bg)', opacity: .6 }}>{p.ro}</span>}
        <span className="tiny" style={{ color: 'var(--bg)', opacity: .45 }}>
          <Icon name="x" size={10} /> {t('phrases.hide')}
        </span>
      </button>
    );
  }

  return (
    <div className="card stack" style={{ gap: 'var(--s3)' }}>
      <div className="row" style={{ gap: 'var(--s3)', alignItems: 'flex-start' }}>
        <span className="grow" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.35 }}>{source}</span>
        <button onClick={() => toggleFav(p.id)} aria-pressed={fav} aria-label={t('phrases.fav')}
          style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer' }}>
          <Icon name={fav ? 'star' : 'o-star'} size={15} color={fav ? 'var(--gold)' : 'var(--muted)'} />
        </button>
      </div>

      <div className="stack" style={{ gap: 5 }}>
        <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
          <span className="tiny faint" style={{ minWidth: 26, fontWeight: 700 }}>FR</span>
          <span className="small grow">{p.fr}</span>
        </div>
        <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
          <span className="tiny faint" style={{ minWidth: 26, fontWeight: 700 }}>AR</span>
          <span className="ar grow" style={{ fontSize: 17 }}>{p.ar}</span>
        </div>
        <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
          <span className="tiny faint" style={{ minWidth: 26, fontWeight: 700 }} title={t('phrases.say')}>
            <Icon name="comment" size={10} />
          </span>
          <span className="small grow" style={{ color: 'var(--gold-deep)', fontStyle: 'italic' }}>{p.ar_lat}</span>
        </div>
        {p.ro && (
          <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
            <span className="tiny faint" style={{ minWidth: 26, fontWeight: 700 }}>RO</span>
            <span className="small grow">{p.ro}</span>
          </div>
        )}
      </div>

      <button className="chip" style={{ alignSelf: 'flex-start' }} onClick={() => setShown(true)}>
        <Icon name="eye" size={11} /> {t('phrases.showThem')}
      </button>
    </div>
  );
}

export default function PhrasesPage() {
  const { t } = useT();
  const { data: phrases, loading } = useData('phrases');
  const favs = useStore((s) => s.favPhrases);
  const [cat, setCat] = useState<PhraseCat | 'all' | 'fav'>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (phrases ?? [])
      .filter((p) => cat === 'all' || (cat === 'fav' ? favs.includes(p.id) : p.cat === cat))
      .filter((p) => !needle
        || p.uk.toLowerCase().includes(needle)
        || p.en.toLowerCase().includes(needle)
        || p.fr.toLowerCase().includes(needle)
        || p.ar_lat.toLowerCase().includes(needle));
  }, [phrases, cat, q, favs]);

  if (loading) return <Spinner label={t('common.loading')} />;

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('phrases.title')} lead={t('phrases.count', { n: phrases?.length ?? 0 })} />

      <input className="input" placeholder={t('phrases.searchHint')} value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="scroll-x">
        {CATS.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c === 'fav' ? <><Icon name="star" size={11} /> {t('phrases.fav')}</> : t(`phrases.cats.${c}` as const)}
          </button>
        ))}
      </div>

      <div className="stack" data-stagger style={{ gap: 'var(--s3)' }}>
        {list.map((p) => <Card key={p.id} p={p} />)}
        {list.length === 0 && (
          <div className="card-flat stack" style={{ alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s8)' }}>
            <Icon name="comment" size={22} color="var(--muted)" />
            <span className="small muted">{t('common.nothingFound')}</span>
          </div>
        )}
      </div>

      <p className="tiny faint" style={{ margin: 0 }}>{t('phrases.legend')}</p>
    </div>
  );
}
