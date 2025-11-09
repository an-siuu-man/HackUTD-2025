import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest and CSS to dist after build
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        copyFileSync(
          resolve(__dirname, 'public/content.css'),
          resolve(__dirname, 'dist/content.css')
        )
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't delete background.js and content.js
  }
})
