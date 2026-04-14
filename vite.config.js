import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/vnua-api': {
        target: 'https://daotao.vnua.edu.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/vnua-api/, ''),
      },
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Web Thong Tin Vu Xuan Lam',
        short_name: 'Vu Xuan Lam',
        description: 'Trang thong tin ca nhan, nghe nhac va mini game.',
        theme_color: '#0b1f2d',
        background_color: '#081623',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
    }),
  ],
});
