import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/barangay-san-agustin-portal/',
  build: {
    chunkSizeWarningLimit: 1000, // Tinaas natin ang limit sa 1000 kB (1MB) para mawala ang warning
  },
})