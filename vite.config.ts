import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'illustrations/*'],
      manifest: {
        name: 'ШЛЯХ — Київ → Chișinău → مراكش',
        short_name: 'ШЛЯХ',
        description: 'Карманный проводник: Київ → Chișinău → Марракеш. Офлайн, чек-листы, SOS.',
        theme_color: '#FAF6EE',
        background_color: '#FAF6EE',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'uk',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          { name: 'SOS', short_name: 'SOS', url: '/sos', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Чек-листы', short_name: 'Чек-листы', url: '/checklist', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 600, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/routing\.openstreetmap\.de\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'osrm-routes',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/data\/.*\.json$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'app-data', expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
        ],
      },
      devOptions: { enabled: true, navigateFallback: 'index.html' },
    }),
  ],
})
