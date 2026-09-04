import { useEffect } from 'react';
import { sfx } from './sound';

/**
 * One delegated listener gives every control in the app a click, instead of
 * threading an onClick through a hundred components. Picks the right sound from
 * what was actually pressed, and stays silent for anything that already plays
 * its own (marked with data-sound="off").
 */
export function useGlobalSound() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        'button, a, [role="button"], [role="checkbox"], [role="option"], summary, label.chip',
      );
      if (!el || el.dataset.sound === 'off' || el.closest('[data-sound="off"]')) return;
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return;

      if (el.getAttribute('aria-label') === 'SOS' || el.getAttribute('href') === '/sos') sfx.alert();
      else if (el.tagName === 'A') sfx.nav();
      else if (el.classList.contains('chip')) sfx.select();
      else sfx.tap();
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName)) sfx.focus();
    };

    // pointerdown rather than click: the sound should land with the finger.
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('focusin', onFocusIn, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, []);
}
