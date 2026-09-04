interface Props { title: string; lead?: string; }

export function PageHeader({ title, lead }: Props) {
  return (
    <div className="stack" style={{ gap: 6, marginBottom: 'var(--s5)' }}>
      <h1>{title}</h1>
      {lead && <p className="small muted" style={{ margin: 0 }}>{lead}</p>}
    </div>
  );
}
