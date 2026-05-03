import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = (env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, '');
  const isDev = mode === 'development';

  return {
    plugins: [react()],

    // ── Dev proxy — only active in development ────────────────────────────────
    server: isDev
      ? {
          proxy: {
            '/api': {
              target: apiUrl,
              changeOrigin: true,
              secure: false,
            },
            '/widget.js': {
              target: apiUrl,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,

    // ── Build configuration ───────────────────────────────────────────────────
    build: {
      target: 'es2015',
      outDir: 'dist',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            ui: ['framer-motion', 'lucide-react', 'react-icons', 'recharts'],
            network: ['axios', 'socket.io-client'],
          },
        },
      },
    },

    // ── Define block — app metadata ────────────────────────────────────────────
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});
