import { useEffect } from 'react';
import { create } from 'zustand';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface SWState {
  needRefresh: boolean;
  update: () => void;
  dismiss: () => void;
  _set: (p: Partial<Pick<SWState, 'needRefresh' | 'update'>>) => void;
}

export const useSW = create<SWState>((set) => ({
  needRefresh: false,
  update: () => {},
  dismiss: () => set({ needRefresh: false }),
  _set: (p) => set(p),
}));

/**
 * Registers the service worker at the app root.
 *
 * This must sit ABOVE the router: the registration used to live in the update
 * banner inside AppLayout, so a first-time visitor — who lands on /onboarding,
 * which renders outside that layout — never registered a worker and got no
 * offline support at all.
 */
export function ServiceWorkerHost() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW: (_url, reg) => {
      // Check for a new build hourly while the app stays open on a long trip.
      if (reg) setInterval(() => void reg.update(), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    useSW.getState()._set({ needRefresh, update: () => void updateServiceWorker(true) });
  }, [needRefresh, updateServiceWorker]);

  return null;
}
