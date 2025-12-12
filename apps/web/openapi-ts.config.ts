import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.json',
  output: {
    path: './src/client',
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/sdk',
      asClass: true,
    },
    {
      name: '@hey-api/schemas',
      type: 'json',
    },
  ],
});
