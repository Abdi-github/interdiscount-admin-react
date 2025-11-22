import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.API_PROXY_TARGET || 'http://localhost:4010';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/app': path.resolve(__dirname, './src/app'),
        '@/features': path.resolve(__dirname, './src/features'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/layouts': path.resolve(__dirname, './src/layouts'),
        '@/routes': path.resolve(__dirname, './src/routes'),
        '@/i18n': path.resolve(__dirname, './src/i18n'),
        '@/styles': path.resolve(__dirname, './src/styles'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      watch: { usePolling: true },
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 8080,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            mui: ['@mui/material', '@mui/icons-material'],
            muix: ['@mui/x-data-grid', '@mui/x-date-pickers'],
            charts: ['recharts'],
            i18n: ['i18next', 'react-i18next'],
          },
        },
      },
    },
  };
});
