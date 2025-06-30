import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  staticDirs: ['../public'],

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  },

  env: (config) => ({
    ...config,
    NEXT_PUBLIC_ENV: 'testnet'
  }),

  webpackFinal: async (config, { configType }) => {
    if (configType === 'PRODUCTION') {
      config.output = config.output || {};
      config.output.publicPath = process.env.BASE_PATH || '/dao-frontend/';
    }
    return config;
  },
}
export default config;
