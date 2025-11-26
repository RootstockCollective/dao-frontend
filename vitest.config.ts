import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Default for React component tests
    setupFiles: './vitest.setup.ts',
    // Use node environment for API route tests to avoid AbortSignal issues with Viem
    environmentMatchGlobs: [
      ['**/api/**/*.test.ts', 'node'],
      ['**/api/**/*.test.tsx', 'node'],
      ['**/providers/**/*.test.ts', 'node'],
    ],
    env: {
      // Hardcoded testnet values for tests
      NEXT_PUBLIC_ENV: 'testnet',
      NEXT_PUBLIC_CHAIN_ID: '31',
      NEXT_PUBLIC_NODE_URL: 'https://public-node.testnet.rsk.co',
      NEXT_PUBLIC_BLOCKSCOUT_URL: 'https://rootstock-testnet.blockscout.com',
      // Token addresses (Rootstock testnet - checksummed)
      NEXT_PUBLIC_RIF_ADDRESS: '0x19F64674D8A5B4E652319F5e239eFd3bc969A1fE',
      NEXT_PUBLIC_STRIF_ADDRESS: '0xC4b091d97AD25ceA5922f09fe80711B7ACBbb16f',
      NEXT_PUBLIC_USDRIF_ADDRESS: '0x8dbf326e12a9fF37ED6DDF75adA548C2640A6482',
      NEXT_PUBLIC_USDT0_ADDRESS: '0x5a2256DD0DfbC8cE121d923AC7D6E7A3fc7F9922',
      // DEX Router addresses (testnet)
      NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS: '0xb51727c996C68E60F598A923a5006853cd2fEB31',
      NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS: '0x244f68e77357f86a8522323eBF80b5FC2F814d3E',
      // TODO: add real address when we support ICECREAMSWAP
      NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS: '0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c',
      // Pool addresses (Rootstock testnet - checksummed)
      NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS: '0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
