import { useRef, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { sfx } from '@/shared/lib/sound';
import { addMedia } from '@/shared/lib/diary';
import { getPosition } from '@/shared/lib/geo';

/** Photo / video / audio / place capture for one diary page. */
interface Props {
  entryId: string;
  onAdded: () => void;
  /** Creates the day's entry on demand — the page may still be blank. */
  ensureEntry: () => Promise<{ id: string }>;
}

export function Capture({ entryId, onAdded, ensureEntry }: Props) {
  const { t } = useT();
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const [recording, setRecording] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const note = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(null), 2200); };

  const pickFiles = async (files: FileList | null, kind: 'photo' | 'video') => {
    if (!files?.length) return;
    sfx.shutter();
    // Attach the current position so the page can show where it was taken.
    let coords: { lat?: number; lon?: number } = {};
    try {
      const p = await getPosition(4000);
      coords = { lat: p.coords.latitude, lon: p.coords.longitude };
    } catch { /* no fix — the media is still worth keeping */ }
    const id = entryId || (await ensureEntry()).id;
    for (const f of Array.from(files)) await addMedia(id, kind, f, coords);
    onAdded();
  };

  const toggleRecord = async () => {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      startedAt.current = Date.now();
      mr.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setRecording(false);
        sfx.recStop();
        const blob = new Blob(chunks.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size > 0) {
          const id = entryId || (await ensureEntry()).id;
          await addMedia(id, 'audio', blob, { durationS: (Date.now() - startedAt.current) / 1000 });
          onAdded();
        }
      };
      recorder.current = mr;
      mr.start();
      setRecording(true);
      sfx.recStart();
    } catch {
      note(t('common.error'));
    }
  };

  const savePlace = async () => {
    try {
      const p = await getPosition();
      // A tiny static map is not available offline, so the pin itself is the note.
      const id = entryId || (await ensureEntry()).id;
      const blob = new Blob([`${p.coords.latitude},${p.coords.longitude}`], { type: 'text/plain' });
      await addMedia(id, 'photo', blob, {
        lat: p.coords.latitude, lon: p.coords.longitude,
        caption: `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`,
      });
      sfx.saved();
      note(t('diary.placeSaved'));
      onAdded();
    } catch {
      note(t('common.error'));
    }
  };

  return (
    <div className="stack" style={{ gap: 'var(--s2)' }}>
      <div className="wrap">
        <button className="chip" onClick={() => photoRef.current?.click()}>
          <Icon name="camera" size={12} /> {t('diary.addPhoto')}
        </button>
        <button className="chip" onClick={() => videoRef.current?.click()}>
          <Icon name="eye" size={12} /> {t('diary.addVideo')}
        </button>
        <button className={`chip ${recording ? 'gold' : ''}`} onClick={() => void toggleRecord()}>
          <Icon name={recording ? 'minus' : 'comment'} size={12} />
          {recording ? t('diary.stop') : t('diary.addAudio')}
        </button>
        <button className="chip" onClick={() => void savePlace()}>
          <Icon name="pin" size={12} /> {t('diary.addPlace')}
        </button>
      </div>

      {recording && (
        <span className="row tiny" style={{ gap: 6, color: 'var(--red)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }}
            className="sos-pulse" />
          {t('diary.recording')}
        </span>
      )}
      {flash && <span className="tiny muted">{flash}</span>}

      <input ref={photoRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => void pickFiles(e.target.files, 'photo')} />
      <input ref={videoRef} type="file" accept="video/*" hidden
        onChange={(e) => void pickFiles(e.target.files, 'video')} />
    </div>
  );
}
