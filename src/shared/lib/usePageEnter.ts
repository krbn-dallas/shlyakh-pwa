import { useEffect, type RefObject } from 'react';

/**
 * Motion is progressive enhancement: CSS handles the base state and GSAP is
 * fetched after paint, so it never sits in the critical bundle.
 */
export function useMotion(
  ref: RefObject<HTMLElement | null>,
  effect: 'pageEnter' | 'drawTimeline',
  deps: unknown[] = [],
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void import('./motion').then((m) => {
      if (cancelled || !ref.current) return;
      cleanup = m[effect](ref.current);
    });

    return () => { cancelled = true; cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
