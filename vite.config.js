// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SweetHouse/',   // <--- EXACT repo name (case-sensitive)
  plugins: [react()],
})
