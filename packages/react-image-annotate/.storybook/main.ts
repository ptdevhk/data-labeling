import { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.story.@(js|jsx)', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  core: {
    disableTelemetry: true
  },

  staticDirs: ['../public'],

  viteFinal: async (config) => {
    // Use classic JSX runtime to avoid React 19 jsxDEV import issues
    config.esbuild = {
      ...config.esbuild,
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    }

    return config
  }
}

export default config
