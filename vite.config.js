import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isSiteBuild = mode === 'site'
  const isBuild = command === 'build'
  const useJsxDev = !isBuild

  const commonConfig = {
    plugins: [
      react({
        // Disable Babel for library builds - let Vite/Rollup handle bundling
        babel: false,
        // Make sure React plugin handles JSX in both .js and .jsx files
        include: /\.(jsx?|tsx?)$/,
      }),
      eslint({
        lintOnStart: false,
        failOnError: false,
      }),
      ...(isBuild && !isSiteBuild
        ? [
            dts({
              include: ['src/lib.js', 'src/Annotator/**/*'],
              outDir: 'dist',
              insertTypesEntry: true,
              copyDtsFiles: true,
            }),
          ]
        : []),
    ],
    publicDir: 'public',
    esbuild: {
      jsx: 'automatic', // Handle JSX in .js files
      jsxDev: useJsxDev,
    },
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: false,
    },
    base: isSiteBuild ? '/react-image-annotate/' : '/',
  }

  if (isSiteBuild) {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2015',
        emptyOutDir: true,
        rollupOptions: {
          input: resolve(__dirname, 'index.html'),
        },
      },
    }
  }

  return {
    ...commonConfig,
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/lib.js'),
          headless: resolve(__dirname, 'src/headless.js'),
        },
        name: 'ReactImageAnnotate',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@emotion/react',
          '@emotion/styled',
          '@mui/material',
          '@mui/icons-material',
          '@mui/styles',
          '@fortawesome/fontawesome-svg-core',
          '@fortawesome/free-solid-svg-icons',
          '@fortawesome/react-fontawesome',
          'immer',
          'react-hotkeys',
          'transformation-matrix-js',
          'use-event-callback',
          'use-key-hook',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          // Preserve module structure for tree-shaking
          preserveModules: false,
        },
      },
      outDir: 'dist',
      sourcemap: true,
      minify: false, // Don't minify for library distribution
      target: 'es2015',
      emptyOutDir: true,
    },
  }
})
