import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
   build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libs into separate chunks
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts':  ['recharts'],
          'vendor-redux':   ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
