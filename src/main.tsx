import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { InstallGate } from '@/widgets/InstallGate';
import { router } from '@/app/router';
import { ServiceWorkerHost } from '@/app/sw';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Above the gate and the router, so the worker registers on every entry path. */}
    <ServiceWorkerHost />
    <InstallGate>
      <RouterProvider router={router} />
    </InstallGate>
  </StrictMode>,
);
