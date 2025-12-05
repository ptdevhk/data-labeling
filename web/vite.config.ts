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
  publicDir: 'public', // Explicitly set public directory
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-is': path.resolve(__dirname, './node_modules/react-is'),
      'prop-types': path.resolve(__dirname, './node_modules/prop-types'),
    },
  },
  optimizeDeps: {
    include: [
      'react-is',
      'prop-types',
      'hoist-non-react-statics',
      '@karlorz/react-image-annotate',
    ],
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
