import { useMemo, useState } from 'react';
import { useStore } from '@/app/store';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ProgressRing } from '@/shared/ui/ProgressRing';
import { Spinner } from '@/shared/ui/Spinner';
import { useData } from '@/shared/lib/data';
import { tr } from '@/shared/lib/l10n';
import type { Audience, CheckItem, CheckSection } from '@/shared/model/types';

/** Which audiences this traveller actually needs to pack for. */
function visibleAudiences(partner: boolean, kids: number): Set<Audience> {
  const s = new Set<Audience>(['both', 'her']);
  if (partner) s.add('him');
  if (kids > 0) s.add('kids');
  return s;
}

function Row({ item, checked, onToggle, onRemove }: {
  item: CheckItem; checked: boolean; onToggle: () => void; onRemove?: () => void;
}) {
  const { lang, t } = useT();
  return (
    <div className="row" style={{ gap: 'var(--s3)', alignItems: 'flex-start' }}>
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        style={{
          flex: '0 0 26px', width: 26, height: 26, marginTop: 1, borderRadius: 8, cursor: 'pointer',
          background: checked ? 'var(--gold)' : 'var(--surface)',
          border: `2px solid ${checked ? 'var(--gold)' : 'var(--line)'}`,
          display: 'grid', placeItems: 'center', transition: 'background .18s, border-color .18s',
        }}
      >
        {checked && <Icon name="check" size={12} color="var(--on-gold)" />}
      </button>

      <button onClick={onToggle} className="grow" style={{
        background: 'none', border: 0, padding: '2px 0', textAlign: 'left', cursor: 'pointer',
        minHeight: 26, minWidth: 0,
      }}>
        <span className="row" style={{ gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 15, lineHeight: 1.35, fontWeight: checked ? 500 : 600,
            color: checked ? 'var(--muted)' : 'var(--ink)',
            textDecoration: checked ? 'line-through' : 'none',
          }}>
            {tr(item.text, lang)}
            {item.critical && !checked && (
              <span aria-label={t('check.critical')} title={t('check.critical')}
                style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--red)', marginLeft: 6, verticalAlign: 'middle',
                }} />
            )}
          </span>
          {item.qty && <span className="tiny badge badge-gold">{item.qty}</span>}
          {item.audience === 'him' && <span className="tiny badge">{t('check.forHim')}</span>}
          {item.audience === 'kids' && <span className="tiny badge">{t('check.forKids')}</span>}
        </span>
        {item.note && !checked && (
          <span className="tiny muted" style={{ display: 'block', marginTop: 3 }}>{tr(item.note, lang)}</span>
        )}
      </button>

      {onRemove && (
        <button className="btn btn-ghost" style={{ minWidth: 30, minHeight: 30, padding: 0, border: 0 }}
          onClick={onRemove} aria-label={t('common.close')}>
          <Icon name="trash" size={12} color="var(--muted)" />
        </button>
      )}
    </div>
  );
}

function SectionCard({ section, items, open, onOpen }: {
  section: CheckSection; items: CheckItem[]; open: boolean; onOpen: () => void;
}) {
  const { t, lang } = useT();
  const checklist = useStore((s) => s.checklist);
  const toggle = useStore((s) => s.toggleCheck);
  const allCustom = useStore((s) => s.customCheck);
  const custom = useMemo(() => allCustom.filter((c) => c.section === section.id), [allCustom, section.id]);
  const addCustom = useStore((s) => s.addCustom);
  const removeCustom = useStore((s) => s.removeCustom);
  const [draft, setDraft] = useState('');

  const all = items.length + custom.length;
  const done = items.filter((i) => checklist[i.id]).length + custom.filter((c) => checklist[c.id]).length;
  const pct = all ? done / all : 0;

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    addCustom(v, section.id);
    setDraft('');
  };

  return (
    <div className="card stack" style={{ gap: open ? 'var(--s4)' : 0, padding: 0, overflow: 'hidden' }}>
      <button onClick={onOpen} aria-expanded={open} className="row" style={{
        gap: 'var(--s3)', padding: 'var(--s4)', background: 'none', border: 0,
        cursor: 'pointer', textAlign: 'left', width: '100%', minHeight: 68,
      }}>
        <ProgressRing value={pct} size={42} stroke={4} label={`${done}`}
          color={pct === 1 ? 'var(--ok)' : 'var(--gold)'} />
        <span className="grow" style={{ minWidth: 0 }}>
          <span className="row" style={{ gap: 8, fontWeight: 800, fontSize: 16 }}>
            <Icon name={section.icon} size={14} color="var(--gold-deep)" />
            <span className="grow truncate">{tr(section.title, lang)}</span>
          </span>
          <span className="tiny muted">{t('check.progress', { done, total: all })}</span>
        </span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} />
      </button>

      {open && (
        <div className="stack fade-up" style={{ gap: 'var(--s4)', padding: '0 var(--s4) var(--s4)' }}>
          {section.note && (
            <div className="card-flat tiny muted" style={{ padding: 'var(--s3)' }}>
              <Icon name="info" size={11} /> {tr(section.note, lang)}
            </div>
          )}
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            {items.map((it) => (
              <Row key={it.id} item={it} checked={!!checklist[it.id]} onToggle={() => toggle(it.id)} />
            ))}
            {custom.map((c) => (
              <Row key={c.id}
                item={{ id: c.id, text: { uk: c.text, en: c.text }, audience: 'both' }}
                checked={!!checklist[c.id]}
                onToggle={() => toggle(c.id)}
                onRemove={() => removeCustom(c.id)} />
            ))}
          </div>
          <div className="row" style={{ gap: 'var(--s2)' }}>
            <input className="input grow" placeholder={t('check.addPlaceholder')} value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
            <button className="btn" onClick={add} disabled={!draft.trim()} aria-label={t('check.addOwn')}>
              <Icon name="plus" size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChecklistPage() {
  const { t, lang } = useT();
  const { data: sections, loading } = useData('checklist');
  const party = useStore((s) => s.party);
  const checklist = useStore((s) => s.checklist);
  const customCheck = useStore((s) => s.customCheck);
  const reset = useStore((s) => s.resetCheck);
  const [open, setOpen] = useState<string | null>('docs');
  const [filter, setFilter] = useState<Audience | 'all'>('all');

  const audiences = useMemo(() => visibleAudiences(party.partner, party.kids), [party]);

  const visible = useMemo(() => {
    if (!sections) return [];
    return sections
      .map((s) => ({
        section: s,
        items: s.items.filter((i) => audiences.has(i.audience) && (filter === 'all' || i.audience === filter)),
      }))
      .filter((x) => x.items.length > 0 || customCheck.some((c) => c.section === x.section.id));
  }, [sections, audiences, filter, customCheck]);

  const total = visible.reduce((n, v) => n + v.items.length, 0) + customCheck.length;
  const done = visible.reduce((n, v) => n + v.items.filter((i) => checklist[i.id]).length, 0)
    + customCheck.filter((c) => checklist[c.id]).length;
  const pct = total ? done / total : 0;

  const share = async () => {
    const text = visible.map((v) =>
      `${tr(v.section.title, lang)}\n` +
      v.items.map((i) => `${checklist[i.id] ? '✓' : '·'} ${tr(i.text, lang)}${i.qty ? ` (${i.qty})` : ''}`).join('\n'),
    ).join('\n\n');
    if (navigator.share) { try { await navigator.share({ title: t('check.title'), text }); return; } catch { /* dismissed */ } }
    try { await navigator.clipboard.writeText(text); } catch { /* denied */ }
  };

  if (loading || !sections) return <Spinner label={t('common.loading')} />;

  const filters: (Audience | 'all')[] = party.partner || party.kids > 0
    ? ['all', 'her', ...(party.partner ? ['him' as const] : []), ...(party.kids ? ['kids' as const] : [])]
    : [];

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      <PageHeader title={t('check.title')} />

      <div className="card row zellige" style={{ gap: 'var(--s4)' }}>
        <ProgressRing value={pct} size={64} stroke={6} color={pct === 1 ? 'var(--ok)' : 'var(--gold)'} />
        <div className="grow stack" style={{ gap: 4 }}>
          <span style={{ fontWeight: 800 }}>{t('check.progress', { done, total })}</span>
          {pct === 1 && <span className="small" style={{ color: 'var(--ok)' }}>{t('check.done100')}</span>}
          <div className="wrap" style={{ marginTop: 4 }}>
            <button className="chip" onClick={() => void share()}>
              <Icon name="share" size={11} /> {t('check.share')}
            </button>
            <button className="chip" onClick={() => { if (confirm(t('check.resetConfirm'))) reset(); }}>
              <Icon name="rotate" size={11} /> {t('common.reset')}
            </button>
          </div>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="scroll-x">
          {filters.map((f) => (
            <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? t('check.filterAll')
                : f === 'her' ? t('check.forHer')
                : f === 'him' ? t('check.forHim') : t('check.forKids')}
            </button>
          ))}
        </div>
      )}

      <div className="stack" data-stagger style={{ gap: 'var(--s3)' }}>
        {visible.map(({ section, items }) => (
          <SectionCard key={section.id} section={section} items={items}
            open={open === section.id} onOpen={() => setOpen(open === section.id ? null : section.id)} />
        ))}
      </div>
    </div>
  );
}
