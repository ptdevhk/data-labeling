import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore - CommonJS module
import semiPluginPkg from '@douyinfe/vite-plugin-semi'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const { vitePluginSemi } = semiPluginPkg

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read version from VERSION file at build time
const version = readFileSync(path.resolve(__dirname, '../VERSION'), 'utf-8').trim()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginSemi({ cssLayer: true }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/token': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
})
