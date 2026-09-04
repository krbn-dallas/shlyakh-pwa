import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Motion tokens from the design code (§3.7). */
export const EASE = 'expo.out';
export const D_ENTER = 0.48;
export const D_SCREEN = 0.35;
export const STAGGER = 0.05;

/**
 * Screen entrance: fade + 12px rise, with a 50ms stagger over any
 * `[data-stagger] > *`. Returns a cleanup that reverts every tween.
 */
export function pageEnter(root: HTMLElement): () => void {
  if (reducedMotion()) return () => {};
  const ctx = gsap.context(() => {
    gsap.fromTo(root,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: D_SCREEN, ease: EASE, clearProps: 'transform' });
    gsap.from('[data-stagger] > *', {
      autoAlpha: 0, y: 16, stagger: STAGGER, duration: D_ENTER,
      ease: EASE, delay: 0.06, clearProps: 'transform,opacity,visibility',
    });
  }, root);
  return () => ctx.revert();
}

/** Draws the gold dashed "shlyakh" line down the timeline as you scroll. */
export function drawTimeline(root: HTMLElement): () => void {
  if (reducedMotion()) return () => {};
  const ctx = gsap.context(() => {
    const line = root.querySelector<HTMLElement>('.dashed-gold');
    if (!line) return;
    gsap.fromTo(line,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        ease: 'none',
        scrollTrigger: { trigger: line, start: 'top 85%', end: 'bottom 60%', scrub: 0.5 },
      });
  }, root);
  return () => ctx.revert();
}

export { gsap, ScrollTrigger };
