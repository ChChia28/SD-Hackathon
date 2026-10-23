/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' + HashRouter lets the build run from any static host or subfolder (GitHub Pages included).
// The PWA plugin precaches every asset, so after one visit the demo works with no internet on stage.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], navigateFallback: 'index.html' },
      manifest: {
        name: 'SunD Wallet · Sime Darby township solar',
        short_name: 'SunD',
        description: 'Live demo of SunD: a township solar ecosystem for Sime Darby Property (Team UrbanByte).',
        theme_color: '#1A1F3A',
        background_color: '#F4F5F7',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  base: './',
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
