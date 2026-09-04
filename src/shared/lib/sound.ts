/**
 * Small synthesised sound set — no audio files to download, nothing to cache,
 * and it stays quiet by default. Everything is soft-attack and short: the point
 * is a texture you barely notice, not a notification chime.
 */
const KEY = 'shlyakh.sound';

let ctx: AudioContext | null = null;

export const soundEnabled = () => localStorage.getItem(KEY) !== '0';
export const setSoundEnabled = (on: boolean) => localStorage.setItem(KEY, on ? '1' : '0');

function audio(): AudioContext | null {
  if (!soundEnabled()) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  freq: number; dur: number; type?: OscillatorType;
  gain?: number; sweepTo?: number; delay?: number;
}

function tone({ freq, dur, type = 'sine', gain = 0.05, sweepTo, delay = 0 }: ToneOpts) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  // Soft attack and a long tail — no clicks, nothing sharp.
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.03, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Filtered noise burst — the paper in "page turn". */
function paper(dur = 0.28, gain = 0.045) {
  const a = audio();
  if (!a) return;
  const frames = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, frames, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    // Noise that swells then falls, so it reads as a sheet lifting and settling.
    const p = i / frames;
    const env = Math.sin(Math.PI * p) ** 1.6;
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2600;
  bp.Q.value = 0.7;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(a.destination);
  src.start();
}

/**
 * A tiny wooden click. Two very short partials rather than one tone, so it
 * reads as a physical tap and not a beep.
 */
function click(base: number, gain = 0.028) {
  tone({ freq: base, dur: 0.035, type: 'triangle', gain });
  tone({ freq: base * 2.4, dur: 0.022, type: 'sine', gain: gain * 0.5, delay: 0.004 });
}

export const sfx = {
  /** Default tap — every button in the app routes through here. */
  tap: () => click(620),
  /** Navigation: a touch lower, so moving around feels different to toggling. */
  nav: () => click(480, 0.03),
  /** Chips, filters, small selections. */
  select: () => click(760, 0.024),
  /** Text field focus — barely there. */
  focus: () => tone({ freq: 1180, dur: 0.03, type: 'sine', gain: 0.012 }),
  /** SOS: firmer and lower, so it never sounds playful. */
  alert: () => { tone({ freq: 320, dur: 0.13, type: 'triangle', gain: 0.05 });
                 tone({ freq: 240, dur: 0.18, type: 'sine', gain: 0.04, delay: 0.07 }); },
  pageTurn: () => paper(0.3, 0.05),
  tick: () => tone({ freq: 880, dur: 0.06, type: 'triangle', gain: 0.03 }),
  check: () => { tone({ freq: 660, dur: 0.09, type: 'sine', gain: 0.04 });
                 tone({ freq: 990, dur: 0.12, type: 'sine', gain: 0.035, delay: 0.06 }); },
  saved: () => { tone({ freq: 523, dur: 0.1, gain: 0.035 });
                 tone({ freq: 784, dur: 0.16, gain: 0.03, delay: 0.08 }); },
  shutter: () => { paper(0.06, 0.05); tone({ freq: 1400, dur: 0.04, type: 'square', gain: 0.02 }); },
  recStart: () => tone({ freq: 440, dur: 0.12, sweepTo: 660, gain: 0.035 }),
  recStop: () => tone({ freq: 660, dur: 0.14, sweepTo: 330, gain: 0.035 }),
  complete: () => [0, 0.1, 0.2, 0.34].forEach((d, i) =>
    tone({ freq: [523, 659, 784, 1047][i], dur: 0.3, gain: 0.035, delay: d })),
};
