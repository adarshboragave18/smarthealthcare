import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  logLevel: 'info',
  clearScreen: false,
  // This forces Vite to filter out specific third-party warnings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})