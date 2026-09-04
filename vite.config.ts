import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the map stack out of the initial bundle — it is only needed on /map.
        manualChunks: (id) =>
          /node_modules\/(leaflet|react-leaflet|@react-leaflet)/.test(id) ? 'leaflet' : undefined,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'sw.ts',
      includeAssets: ['favicon.svg', 'icons/*.png', 'illustrations/*'],
      manifest: {
        name: 'ШЛЯХ — Київ · Chișinău · Марракеш',
        short_name: 'ШЛЯХ',
        description: 'Кишеньковий провідник: Київ → Chișinău → Марракеш. Працює офлайн: SOS, чек-листи, маршрут, карта.',
        theme_color: '#FAF6EE',
        background_color: '#FAF6EE',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'uk',
        categories: ['travel', 'navigation', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          { name: 'SOS', short_name: 'SOS', url: '/sos', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Чек-листи', short_name: 'Чек-листи', url: '/checklist', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Розмовник', short_name: 'Розмовник', url: '/phrases', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: { enabled: false, navigateFallback: 'index.html' },
    }),
  ],
})
