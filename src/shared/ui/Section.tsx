import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface Props { icon?: string; title: string; action?: ReactNode; children: ReactNode; note?: string; }

export function Section({ icon, title, action, note, children }: Props) {
  return (
    <section className="stack" style={{ gap: 'var(--s3)' }}>
      <div className="row-between">
        <h2 className="row" style={{ gap: 'var(--s2)', fontSize: 18 }}>
          {icon && <Icon name={icon} size={15} color="var(--gold-deep)" />}
          {title}
        </h2>
        {action}
      </div>
      {note && <p className="tiny muted" style={{ margin: 0 }}>{note}</p>}
      {children}
    </section>
  );
}
