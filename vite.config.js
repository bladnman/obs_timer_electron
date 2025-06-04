import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron to load files correctly
  build: {
    outDir: 'dist/client', // Output directory for the React app
    rollupOptions: {
        // Ensure that assets are correctly referenced in Electron
        output: {
            // Adjust asset file names if necessary, default should be fine
            // assetFileNames: (assetInfo) => {
            //   let extType = assetInfo.name.split('.').at(1);
            //   if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            //     extType = 'img';
            //   }
            //   return `assets/${extType}/[name]-[hash][extname]`;
            // },
            // chunkFileNames: 'assets/js/[name]-[hash].js',
            // entryFileNames: 'assets/js/[name]-[hash].js',
        },
    }
  }
});
