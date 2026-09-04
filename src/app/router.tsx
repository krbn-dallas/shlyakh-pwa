import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from './layout';
import { HomePage } from '../features/home/page';
import { ItineraryPage } from '../features/itinerary/page';
import { ChecklistPage } from '../features/checklist/page';
import { SosPage } from '../features/sos/page';
import { PoiPage } from '../features/poi/page';
import { ServicesPage } from '../features/services/page';
import { SafetyPage } from '../features/safety/page';
import { SettingsPage } from '../features/settings/page';
import { PhrasesPage } from '../features/phrases/page';
import { MorePage } from '../features/more/page';
import { OnboardingPage } from '../features/onboarding/page';

const MapPage = lazy(()=> import('../features/map/page').then(m=>({default:m.MapPage})));

export const router = createBrowserRouter([
  { path:'/onboarding', element:<OnboardingPage/>},
  { path:'/', element:<AppLayout/>, children:[
    { index:true, element:<HomePage/>},
    { path:'itinerary', element:<ItineraryPage/>},
    { path:'checklist', element:<ChecklistPage/>},
    { path:'sos', element:<SosPage/>},
    { path:'map', element:<Suspense fallback={<div>Завантаження карти...</div>}><MapPage/></Suspense>},
    { path:'poi', element:<PoiPage/>},
    { path:'services', element:<ServicesPage/>},
    { path:'safety', element:<SafetyPage/>},
    { path:'settings', element:<SettingsPage/>},
    { path:'phrases', element:<PhrasesPage/>},
    { path:'more', element:<MorePage/>},
  ]}
]);
