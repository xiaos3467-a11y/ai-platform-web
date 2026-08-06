import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Upload source maps to Sentry after build (only when DSN + auth token are set)
    sentryVitePlugin({
      disable: !process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG || 'ai-platform',
      project: process.env.SENTRY_PROJECT || 'web-console',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: ['./dist/assets/**'],
      },
      release: {
        name: process.env.SENTRY_RELEASE || 'dev',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/live': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Split vendor chunks for better long-term caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-utils': ['axios', 'zustand', 'dayjs'],
        },
      },
    },
  },
});
