import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Read a single `KEY=value` from a repo `.env*` file so Vitest stays aligned with committed env (no duplicated literals). */
function readDotenvKey(relativePath: string, key: string, fallback: string): string {
  try {
    const text = readFileSync(path.join(__dirname, relativePath), 'utf8')
    for (const line of text.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      if (t.startsWith(`${key}=`)) {
        return t
          .slice(key.length + 1)
          .trim()
          .replaceAll(/^['"]|['"]$/g, '')
      }
    }
  } catch {
    // missing file in some sandboxes / partial checkouts
  }
  return fallback
}

const wrbtcMainnetFromEnvFork = readDotenvKey(
  '.env.fork',
  'NEXT_PUBLIC_WRBTC_ADDRESS',
  '0x542fda317318ebf1d3deaf76e0b632741a7e677d',
)

const alias = { '@': path.resolve(__dirname, './src') }
const reactPlugin = react({ jsxRuntime: 'automatic' })

// Check if fork is available - only run fork project when FORK_RPC_URL is set
const hasForkRpc = Boolean(process.env.FORK_RPC_URL)

const unitTestnetEnv = {
  JWT_SECRET: 'test-jwt',
  NEXT_PUBLIC_ENV: 'testnet',
  NEXT_PUBLIC_CHAIN_ID: '31',
  NEXT_PUBLIC_NODE_URL: 'https://public-node.testnet.rsk.co',
  NEXT_PUBLIC_BLOCKSCOUT_URL: 'https://rootstock-testnet.blockscout.com',
  NEXT_PUBLIC_RIF_ADDRESS: '0x19F64674D8A5B4E652319F5e239eFd3bc969A1fE',
  NEXT_PUBLIC_STRIF_ADDRESS: '0xC4b091d97AD25ceA5922f09fe80711B7ACBbb16f',
  NEXT_PUBLIC_USDRIF_ADDRESS: '0x8dbf326e12a9fF37ED6DDF75adA548C2640A6482',
  NEXT_PUBLIC_USDT0_ADDRESS: '0x5a2256DD0DfbC8cE121d923AC7D6E7A3fc7F9922',
  NEXT_PUBLIC_WRBTC_ADDRESS: '0x69fe5cec81d5ef92600c1a0db1f11986ab3758ab',
  NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS: '0xb51727c996C68E60F598A923a5006853cd2fEB31',
  NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS: '0x244f68e77357f86a8522323eBF80b5FC2F814d3E',
  NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS: '0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c',
  NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS: '0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0',
} as const

const forkPublicEnv = {
  NEXT_PUBLIC_ENV: 'fork',
  NEXT_PUBLIC_CHAIN_ID: '31337',
  NEXT_PUBLIC_NODE_URL: process.env.FORK_RPC_URL!,
  NEXT_PUBLIC_BLOCKSCOUT_URL: 'https://rootstock.blockscout.com',
  NEXT_PUBLIC_RIF_ADDRESS: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
  NEXT_PUBLIC_STRIF_ADDRESS: '0x5db91e24bd32059584bbdb831a901f1199f3d459',
  NEXT_PUBLIC_USDRIF_ADDRESS: '0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37',
  NEXT_PUBLIC_USDT0_ADDRESS: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
  NEXT_PUBLIC_WRBTC_ADDRESS: wrbtcMainnetFromEnvFork,
  NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS: '0xb51727c996C68E60F598A923a5006853cd2fEB31',
  NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS: '0x244f68e77357f86a8522323eBF80b5FC2F814d3E',
  NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS: '0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c',
  NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS: '0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0',
} as const

// Fork: node env for viem + API routes. Files that need DOM use // @vitest-environment jsdom
const forkProject = {
  plugins: [reactPlugin],
  resolve: { alias },
  test: {
    name: 'fork',
    fileParallelism: false,
    environment: 'node' as const,
    setupFiles: path.join(__dirname, 'vitest.setup.ts'),
    include: [
      '**/swap/**/*.test.ts',
      '**/swap/**/*.test.tsx',
      '**/Swap/**/*.test.ts',
      '**/Swap/**/*.test.tsx',
      '**/providers/uniswap.test.ts',
      '**/api/swap/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**'],
    env: forkPublicEnv,
  },
}

export default defineConfig({
  plugins: [reactPlugin],
  test: {
    projects: [
      {
        plugins: [reactPlugin],
        resolve: { alias },
        test: {
          name: 'unit-jsdom',
          environment: 'jsdom',
          setupFiles: path.join(__dirname, 'vitest.setup.ts'),
          exclude: [
            '**/node_modules/**',
            '**/.worktree*/**',
            'src/lib/swap/utils.test.ts',
            'src/lib/swap/permit2.test.ts',
            'src/lib/swap/providers/**/*.test.ts',
            '**/swap/**/*.test.tsx',
            '**/Swap/**/*.test.ts',
            '**/Swap/**/*.test.tsx',
            '**/providers/uniswap.test.ts',
            '**/api/swap/**/*.test.ts',
            '**/api/**/*.test.ts',
            '**/api/**/*.test.tsx',
          ],
          env: unitTestnetEnv,
        },
      },
      {
        plugins: [reactPlugin],
        resolve: { alias },
        test: {
          name: 'unit-node',
          environment: 'node',
          setupFiles: path.join(__dirname, 'vitest.setup.ts'),
          include: ['**/api/**/*.test.ts', '**/api/**/*.test.tsx'],
          exclude: ['**/node_modules/**', '**/api/swap/**/*.test.ts'],
          env: unitTestnetEnv,
        },
      },
      ...(hasForkRpc ? [forkProject] : []),
    ],
  },
})
