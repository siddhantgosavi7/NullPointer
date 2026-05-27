import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/AGTECHATHON-2.0-2k26/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
});
