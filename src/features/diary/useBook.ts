import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/shared/lib/sound';

export type Dir = 'next' | 'prev';

interface Opts {
  count: number;
  index: number;
  onSettle: (next: number) => void;
}

/**
 * Page-turn mechanics for the diary.
 *
 * A real sheet pivots on the spine, so the turning page rotates about its LEFT
 * edge in 3D while a shadow deepens across it. Going back, the previous sheet
 * starts folded open and closes toward you. Swiping drives the same rotation
 * directly, so a drag is the animation rather than a trigger for it.
 */
export function useBook({ count, index, onSettle }: Opts) {
  const turning = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState<Dir | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);
  const start = useRef({ x: 0, y: 0, active: false, decided: false, horizontal: false });

  const canGo = useCallback(
    (d: Dir) => (d === 'next' ? index < count - 1 : index > 0),
    [index, count],
  );

  /** 0 → flat, 1 → fully turned. */
  const paint = useCallback((p: number, d: Dir) => {
    const el = turning.current;
    if (!el) return;
    const angle = d === 'next' ? -p * 180 : -(1 - p) * 180;
    el.style.transform = `rotateY(${angle}deg)`;
    // The lift reads as a curl: brightest at the spine, dark across the fold.
    if (shade.current) shade.current.style.opacity = String(Math.sin(p * Math.PI) * 0.75);
  }, []);

  const animate = useCallback(async (d: Dir, from: number) => {
    const el = turning.current;
    if (!el) return;
    const { gsap } = await import('@/shared/lib/motion');
    const state = { p: from };
    return new Promise<void>((resolve) => {
      gsap.to(state, {
        p: 1,
        duration: 0.52 * (1 - from),
        ease: 'power2.inOut',
        onUpdate: () => paint(state.p, d),
        onComplete: resolve,
      });
    });
  }, [paint]);

  const snapBack = useCallback(async (d: Dir, from: number) => {
    const { gsap } = await import('@/shared/lib/motion');
    const state = { p: from };
    return new Promise<void>((resolve) => {
      gsap.to(state, {
        p: 0, duration: 0.3, ease: 'power2.out',
        onUpdate: () => paint(state.p, d), onComplete: resolve,
      });
    });
  }, [paint]);

  const go = useCallback(async (d: Dir) => {
    if (busy.current || !canGo(d)) return;
    busy.current = true;
    setDir(d);
    // Let React mount the turning sheet before it starts moving.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    paint(0, d);
    sfx.pageTurn();
    await animate(d, 0);
    onSettle(d === 'next' ? index + 1 : index - 1);
    setDir(null);
    if (shade.current) shade.current.style.opacity = '0';
    busy.current = false;
  }, [animate, canGo, index, onSettle, paint]);

  // ---- swipe -------------------------------------------------------------

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (busy.current || e.pointerType === 'mouse') return;
    start.current = { x: e.clientX, y: e.clientY, active: true, decided: false, horizontal: false };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = start.current;
    if (!s.active || busy.current) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;

    // Decide once whether this is a page swipe or a vertical scroll.
    if (!s.decided) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      s.decided = true;
      s.horizontal = Math.abs(dx) > Math.abs(dy) * 1.4;
      if (!s.horizontal) { s.active = false; return; }
      const d: Dir = dx < 0 ? 'next' : 'prev';
      if (!canGo(d)) { s.active = false; return; }
      setDir(d);
      setDragging(true);
      sfx.pageTurn();
      return;
    }
    if (!s.horizontal) return;

    const d: Dir = dx < 0 ? 'next' : 'prev';
    const width = (e.currentTarget as HTMLElement).clientWidth || 1;
    paint(Math.min(1, Math.max(0, Math.abs(dx) / width)), d);
  }, [canGo, paint]);

  const onPointerUp = useCallback(async (e: React.PointerEvent) => {
    const s = start.current;
    if (!s.active || !s.decided || !s.horizontal) { start.current.active = false; return; }
    start.current.active = false;

    const dx = e.clientX - s.x;
    const width = (e.currentTarget as HTMLElement).clientWidth || 1;
    const p = Math.min(1, Math.abs(dx) / width);
    const d: Dir = dx < 0 ? 'next' : 'prev';
    setDragging(false);
    busy.current = true;

    // Past a third of the width, or a quick flick, and it completes.
    if (p > 0.33) {
      await animate(d, p);
      onSettle(d === 'next' ? index + 1 : index - 1);
    } else {
      await snapBack(d, p);
    }
    setDir(null);
    if (shade.current) shade.current.style.opacity = '0';
    busy.current = false;
  }, [animate, index, onSettle, snapBack]);

  // Reset any inline transform when the page actually changes.
  useEffect(() => {
    if (turning.current) turning.current.style.transform = '';
  }, [index]);

  return {
    turning, shade, dir, dragging, go, canGo,
    swipeHandlers: {
      onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp,
    },
  };
}
