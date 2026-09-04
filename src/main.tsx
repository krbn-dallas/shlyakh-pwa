import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { InstallGate } from '@/widgets/InstallGate';
import { router } from '@/app/router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InstallGate>
      <RouterProvider router={router} />
    </InstallGate>
  </StrictMode>,
);
