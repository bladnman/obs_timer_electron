import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      // Pass esbuild options directly to the React plugin
      esbuild: {
        target: 'esnext',
      },
    }),
  ],
  root: process.cwd(),
  publicDir: path.resolve(process.cwd(), 'public'),
  base: '/', // Simplified for now
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // Global esbuild settings for Vite's own transforms
  esbuild: {
    target: 'esnext',
  },
  // esbuild settings for Vite's dependency optimizer
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      '/src': path.resolve(process.cwd(), 'src'),
    },
  },
  // Build config can be restored later with conditional base
  build: {
    outDir: path.resolve(process.cwd(), 'dist/client'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
    },
  },
});
