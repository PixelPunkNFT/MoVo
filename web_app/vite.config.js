import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'Movo.png'],
      manifest: {
        name: 'Movo - Passaggi & Eventi Latino',
        short_name: 'Movo',
        description: 'Passaggi e prevendite per la community latina di Roma',
        theme_color: '#0F0F0F',
        background_color: '#0F0F0F',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'it-IT',
        categories: ['social', 'travel', 'music'],
        icons: [
          { src: '/Movo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/Movo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/Movo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/pwa-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
})
