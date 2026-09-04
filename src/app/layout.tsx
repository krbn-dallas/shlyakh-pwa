import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/widgets/Header';
import { TabBar } from '@/widgets/TabBar';
import { OfflineBadge } from '@/widgets/OfflineBadge';
import { UpdatePrompt } from '@/widgets/UpdatePrompt';
import { useStore } from '@/app/store';
import { load } from '@/shared/lib/data';
import { cityByCoord, getPosition } from '@/shared/lib/geo';
import { useMotion } from '@/shared/lib/usePageEnter';
import { useGlobalSound } from '@/shared/lib/useGlobalSound';

export function AppLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const cityManual = useStore((s) => s.cityManual);
  const geoAsked = useStore((s) => s.geoAsked);
  const setCity = useStore((s) => s.setCity);

  // Auto-detect the city only when the user hasn't pinned one and has already
  // been asked about location during onboarding.
  useEffect(() => {
    if (cityManual || !geoAsked) return;
    let alive = true;
    const id = setTimeout(async () => {
      try {
        const [pos, cities] = await Promise.all([getPosition(), load('cities')]);
        if (!alive) return;
        const found = cityByCoord(pos.coords.latitude, pos.coords.longitude, cities);
        if (found) setCity(found, false);
      } catch { /* denied, timed out, or offline — the manual switcher still works */ }
    }, 600);
    return () => { alive = false; clearTimeout(id); };
  }, [cityManual, geoAsked, setCity]);

  // One entrance animation for every screen, replayed on navigation.
  useMotion(mainRef, 'pageEnter', [pathname]);
  // One delegated listener gives every control its click.
  useGlobalSound();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <OfflineBadge />
      <main
        ref={mainRef}
        key={pathname}
        className="container"
        style={{
          flex: 1, width: '100%',
          paddingTop: 'var(--s4)',
          paddingBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--s8))',
        }}
      >
        <Outlet />
      </main>
      <TabBar />
      <UpdatePrompt />
    </div>
  );
}
