import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'

export default defineConfig({
  plugins: [react(), vike()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
