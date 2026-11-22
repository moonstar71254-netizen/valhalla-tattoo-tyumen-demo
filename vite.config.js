import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-core': ['three'],
          'r3f-drei': ['@react-three/fiber', '@react-three/drei'],
          'motion-scroll': ['gsap', '@gsap/react', 'motion', 'lenis'],
        },
      },
    },
  },
});
