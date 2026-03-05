import type { StorybookConfig } from '@storybook/nextjs'
import { config as dotenvConfig } from 'dotenv'

// Load environment variables using the same PROFILE mechanism as next.config.mjs.
// Defaults to 'dev' because Storybook needs valid contract addresses (RIF, stRIF, USDRIF, etc.)
// at module init time — tokens.ts calls viem's getAddress() on these values during import.
// The 'dev' profile provides all required NEXT_PUBLIC_* vars with fast voting delays,
// making it the most suitable default for local component development.
// The CI workflow (storybook.yml) also relies on this default since it doesn't set PROFILE.
// Override with: PROFILE=testnet npm run storybook
const profile = process.env.PROFILE || 'dev'
const envPath = profile.startsWith('.env.') ? profile : `.env.${profile}`
dotenvConfig({ path: envPath })

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  staticDirs: ['../public'],

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  env: envConfig => ({
    ...envConfig,
    // Spread all NEXT_PUBLIC_ vars loaded by dotenv so contract addresses, feature flags, etc. are available
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] =>
          entry[0].startsWith('NEXT_PUBLIC_') && typeof entry[1] === 'string',
      ),
    ),
  }),
}
export default config
