import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the build works from any GitHub Pages project
  // sub-path (/repo-name/) without editing config per repository.
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3000,
    open: false
  }
})
