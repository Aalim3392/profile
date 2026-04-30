import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'zustand'],
          'vendor-ui': ['lucide-react', 'react-hot-toast', 'react-markdown'],
          'vendor-charts': ['recharts', 'date-fns'],
          'vendor-network': ['axios'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
