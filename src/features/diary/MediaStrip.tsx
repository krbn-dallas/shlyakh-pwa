import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { sfx } from '@/shared/lib/sound';
import { deleteMedia, mediaSrc, updateMedia } from '@/shared/lib/diary';
import type { DiaryMedia } from '@/shared/model/diary';

function Audio({ m }: { m: DiaryMedia }) {
  const src = useMemo(() => mediaSrc(m), [m.id, m.blob, m.url]);
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => { if (m.blob) URL.revokeObjectURL(src); }, [src, m.blob]);

  return (
    <div className="cassette row" style={{ gap: 'var(--s3)' }}>
      <div className={`reel ${playing ? 'spin' : ''}`} />
      <button
        className="btn btn-ghost"
        style={{ minWidth: 40, minHeight: 40, padding: 0 }}
        onClick={() => {
          const a = ref.current;
          if (!a) return;
          if (a.paused) { void a.play(); setPlaying(true); }
          else { a.pause(); setPlaying(false); }
        }}
        aria-label={playing ? 'pause' : 'play'}
      >
        <Icon name={playing ? 'minus' : 'arrow-right'} size={14} />
      </button>
      <div className={`reel ${playing ? 'spin' : ''}`} />
      <span className="grow tiny muted">
        {m.durationS ? `${Math.round(m.durationS)}s` : 'audio'}
      </span>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} preload="none" />
    </div>
  );
}

export function MediaStrip({ items, onChange }: { items: DiaryMedia[]; onChange: () => void }) {
  const { t } = useT();
  const [editing, setEditing] = useState<string | null>(null);

  if (!items.length) return null;

  return (
    <div className="stack" style={{ gap: 'var(--s4)' }}>
      {items.map((m) => {
        if (m.kind === 'audio') return <Audio key={m.id} m={m} />;
        const src = mediaSrc(m);
        return (
          <figure key={m.id} className="taped" style={{ margin: 0, transform: `rotate(${m.rotation}deg)` }}>
            {m.kind === 'video'
              ? <video src={src} controls playsInline preload="metadata" />
              : <img src={src} alt={m.caption ?? ''} loading="lazy" />}

            {editing === m.id ? (
              <input
                className="input"
                autoFocus
                defaultValue={m.caption ?? ''}
                style={{ marginTop: 6, minHeight: 34, fontSize: 13 }}
                onBlur={(e) => { void updateMedia(m.id, { caption: e.target.value }).then(onChange); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              />
            ) : (
              <figcaption onClick={() => setEditing(m.id)} style={{ cursor: 'text' }}>
                {m.caption || t('diary.addCaption')}
              </figcaption>
            )}

            <button
              onClick={() => { sfx.tick(); void deleteMedia(m.id).then(onChange); }}
              aria-label={t('common.close')}
              style={{
                position: 'absolute', top: -8, right: -8, width: 26, height: 26,
                borderRadius: '50%', border: 0, background: 'var(--red)',
                color: 'var(--on-red)', cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}
            >
              <Icon name="x" size={10} />
            </button>
          </figure>
        );
      })}
    </div>
  );
}
