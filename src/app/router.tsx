import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { AppLayout } from './layout';
import { useStore } from './store';
import { Spinner } from '@/shared/ui/Spinner';
import { lazyWithReload } from './lazy';
import { ErrorScreen } from './ErrorScreen';

import HomePage from '@/features/home/page';
import ItineraryPage from '@/features/itinerary/page';
import ChecklistPage from '@/features/checklist/page';
import SosPage from '@/features/sos/page';
import PoiPage from '@/features/poi/page';
import MorePage from '@/features/more/page';
import OnboardingPage from '@/features/onboarding/page';

// Split the heavy leaves out of the initial bundle.
const MapPage = lazyWithReload(() => import('@/features/map/page'));
const ServicesPage = lazyWithReload(() => import('@/features/services/page'));
const SafetyPage = lazyWithReload(() => import('@/features/safety/page'));
const PhrasesPage = lazyWithReload(() => import('@/features/phrases/page'));
const GuidePage = lazyWithReload(() => import('@/features/guide/page'));
const DiaryPage = lazyWithReload(() => import('@/features/diary/page'));
const SettingsPage = lazyWithReload(() => import('@/features/settings/page'));

const L = (node: ReactNode) => <Suspense fallback={<Spinner />}>{node}</Suspense>;

/** Runs before the layout renders, so the app never flashes before redirecting. */
const requireOnboarding = () => {
  const { onboarded, departure } = useStore.getState();
  if (!onboarded || !departure) throw redirect('/onboarding');
  return null;
};

export const router = createBrowserRouter([
  { path: '/onboarding', element: <OnboardingPage />, errorElement: <ErrorScreen /> },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorScreen />,
    loader: requireOnboarding,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'itinerary', element: <ItineraryPage /> },
      { path: 'checklist', element: <ChecklistPage /> },
      { path: 'sos', element: <SosPage /> },
      { path: 'poi', element: <PoiPage /> },
      { path: 'more', element: <MorePage /> },
      { path: 'map', element: L(<MapPage />) },
      { path: 'services', element: L(<ServicesPage />) },
      { path: 'safety', element: L(<SafetyPage />) },
      { path: 'phrases', element: L(<PhrasesPage />) },
      { path: 'guide', element: L(<GuidePage />) },
      { path: 'diary', element: L(<DiaryPage />) },
      { path: 'settings', element: L(<SettingsPage />) },
      { path: '*', element: <HomePage /> },
    ],
  },
]);
