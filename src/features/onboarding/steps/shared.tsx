import type { ReactNode } from 'react';
import { Icon } from '@/shared/ui/Icon';

export function StepShell({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <div className="stack fade-up" style={{ gap: 'var(--s5)' }}>
      <div className="stack" style={{ gap: 'var(--s2)' }}>
        <h1>{title}</h1>
        {lead && <p className="muted" style={{ margin: 0 }}>{lead}</p>}
      </div>
      {children}
    </div>
  );
}

interface CardChoiceProps {
  active: boolean;
  onClick: () => void;
  icon?: string;
  title: string;
  note?: string;
  right?: ReactNode;
}

export function CardChoice({ active, onClick, icon, title, note, right }: CardChoiceProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="row"
      style={{
        width: '100%', gap: 'var(--s3)', textAlign: 'left', cursor: 'pointer',
        padding: 'var(--s4)', minHeight: 64,
        background: active ? 'var(--gold-soft)' : 'var(--surface)',
        border: `2px solid ${active ? 'var(--gold)' : 'var(--line)'}`,
        borderRadius: 'var(--r-card)',
        transition: 'background .18s, border-color .18s',
      }}
    >
      {icon && (
        <span style={{
          flex: '0 0 40px', width: 40, height: 40, borderRadius: 'var(--r-ctl)',
          background: active ? 'var(--gold)' : 'var(--surface-2)',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name={icon} size={16} color={active ? 'var(--on-gold)' : 'var(--muted)'} />
        </span>
      )}
      <span className="grow" style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 15 }}>{title}</span>
        {note && <span className="tiny muted" style={{ display: 'block', marginTop: 2 }}>{note}</span>}
      </span>
      {right ?? (active && <Icon name="circle-check" size={18} color="var(--gold-deep)" />)}
    </button>
  );
}
