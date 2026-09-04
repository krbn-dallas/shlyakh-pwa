import { lazy, type ComponentType } from 'react';

const FLAG = 'shlyakh.chunkReload';

/**
 * After a redeploy the old hashed chunk names disappear. An already-open tab
 * still asks for them, Netlify answers the SPA fallback with index.html, and
 * the dynamic import dies with "text/html is not a valid JavaScript MIME type".
 *
 * One reload picks up the new index.html and the correct hashes. The flag stops
 * a reload loop if the failure is something else.
 */
export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    factory()
      .then((mod) => {
        sessionStorage.removeItem(FLAG);
        return mod;
      })
      .catch((err: unknown) => {
        const msg = String((err as Error)?.message ?? err);
        const stale = /MIME type|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(msg);
        if (stale && !sessionStorage.getItem(FLAG)) {
          sessionStorage.setItem(FLAG, '1');
          window.location.reload();
          // Never resolves — the reload takes over before React can render.
          return new Promise<{ default: T }>(() => {});
        }
        throw err;
      }),
  );
}
