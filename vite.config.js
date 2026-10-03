import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/aikatsu-encore-manager/',
  plugins: [react()],
})
