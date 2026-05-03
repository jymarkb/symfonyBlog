import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vike from 'vike/plugin'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [svgr(), react(), tailwindcss(), vike()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
