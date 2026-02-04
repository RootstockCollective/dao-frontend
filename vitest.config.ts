import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if fork is available - only run fork project when FORK_RPC_URL is set
const hasForkRpc = Boolean(process.env.FORK_RPC_URL)

// Fork project configuration - only included when FORK_RPC_URL is set
const forkProject = {
  // Fork project: for swap/quote tests with local fork
  // Use this project when you want to test swap execution (not just quotes) without spending real funds
  plugins: [react({ jsxRuntime: 'automatic' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom' as const,
    setupFiles: './vitest.setup.ts',
    // Use node environment for API route tests
    environmentMatchGlobs: [
      ['**/api/**/*.test.ts', 'node'],
      ['**/api/**/*.test.tsx', 'node'],
      ['**/providers/**/*.test.ts', 'node'],
    ] as [string, 'node'][],
    // Only include swap/quote tests in fork project
    // Note: Fork is required for testing swap execution (write operations) without spending real funds
    include: [
      '**/swap/**/*.test.ts',
      '**/swap/**/*.test.tsx',
      '**/providers/uniswap.test.ts',
      '**/api/swap/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**'],
    env: {
      // Fork configuration for swap tests
      // Uses local fork of Rootstock Mainnet - allows testing swap execution without real funds
      NEXT_PUBLIC_ENV: 'fork',
      NEXT_PUBLIC_CHAIN_ID: '31337', // Local fork chain ID (Anvil default, avoids MetaMask conflicts)
      NEXT_PUBLIC_NODE_URL: process.env.FORK_RPC_URL!,
      NEXT_PUBLIC_BLOCKSCOUT_URL: 'https://rootstock.blockscout.com',
      // Token addresses (Rootstock mainnet - same as mainnet, available on fork)
      NEXT_PUBLIC_RIF_ADDRESS: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
      NEXT_PUBLIC_USDRIF_ADDRESS: '0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37',
      NEXT_PUBLIC_USDT0_ADDRESS: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
      // DEX Router addresses (Rootstock mainnet - available on fork)
      NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS: '0xb51727c996C68E60F598A923a5006853cd2fEB31',
      NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS: '0x244f68e77357f86a8522323eBF80b5FC2F814d3E',
      NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS: '0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c',
      // Pool addresses (Rootstock mainnet - available on fork)
      NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS: '0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0',
    },
  },
}

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  test: {
    // Use projects to define different configurations for different test files
    // Fork project is only included when FORK_RPC_URL is set to avoid localhost:8545 timeout in CI
    projects: [
      {
        // Default project: testnet configuration for most tests
        plugins: [react({ jsxRuntime: 'automatic' })],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
        test: {
          environment: 'jsdom',
          setupFiles: './vitest.setup.ts',
          // Use node environment for API route tests to avoid AbortSignal issues with Viem
          environmentMatchGlobs: [
            ['**/api/**/*.test.ts', 'node'],
            ['**/api/**/*.test.tsx', 'node'],
            ['**/providers/**/*.test.ts', 'node'],
          ],
          // Exclude swap/quote tests from testnet project
          exclude: [
            '**/node_modules/**',
            '**/swap/**/*.test.ts',
            '**/swap/**/*.test.tsx',
            '**/providers/uniswap.test.ts',
            '**/api/swap/**/*.test.ts',
          ],
          env: {
            // Testnet configuration
            NEXT_PUBLIC_ENV: 'testnet',
            NEXT_PUBLIC_CHAIN_ID: '31',
            NEXT_PUBLIC_NODE_URL: 'https://public-node.testnet.rsk.co',
            NEXT_PUBLIC_BLOCKSCOUT_URL: 'https://rootstock-testnet.blockscout.com',
            // Token addresses (Rootstock testnet - checksummed)
            // Verified: stRIF and USDRIF exist on testnet
            // TODO: Verify RIF and USDT0 addresses on testnet
            NEXT_PUBLIC_RIF_ADDRESS: '0x19F64674D8A5B4E652319F5e239eFd3bc969A1fE',
            NEXT_PUBLIC_STRIF_ADDRESS: '0xC4b091d97AD25ceA5922f09fe80711B7ACBbb16f',
            NEXT_PUBLIC_USDRIF_ADDRESS: '0x8dbf326e12a9fF37ED6DDF75adA548C2640A6482',
            NEXT_PUBLIC_USDT0_ADDRESS: '0x5a2256DD0DfbC8cE121d923AC7D6E7A3fc7F9922',
            // DEX Router addresses
            // NOTE: QuoterV2 and UniversalRouter are NOT deployed on testnet - these are mainnet addresses
            // They are included here for completeness but will not work on testnet
            NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS: '0xb51727c996C68E60F598A923a5006853cd2fEB31', // Mainnet only
            NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS: '0x244f68e77357f86a8522323eBF80b5FC2F814d3E', // Mainnet only
            NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS: '0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c',
            // Pool addresses (Rootstock testnet - checksummed)
            NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS: '0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0',
          },
        },
      },
      {
        // Mainnet project: for swap/quote tests only
        plugins: [react({ jsxRuntime: 'automatic' })],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
        test: {
          environment: 'jsdom',
          setupFiles: './vitest.setup.ts',
          // Use node environment for API route tests
          environmentMatchGlobs: [
            ['**/api/**/*.test.ts', 'node'],
            ['**/api/**/*.test.tsx', 'node'],
            ['**/providers/**/*.test.ts', 'node'],
          ],
          // Only include swap/quote tests in mainnet project
          include: [
            '**/swap/**/*.test.ts',
            '**/swap/**/*.test.tsx',
            '**/providers/uniswap.test.ts',
            '**/api/swap/**/*.test.ts',
          ],
          exclude: ['**/node_modules/**'],
          env: {
            // Mainnet configuration for quote tests
            // Quoting is read-only (view function), so it's safe to test on mainnet - no transactions or gas costs
            NEXT_PUBLIC_ENV: 'mainnet',
            NEXT_PUBLIC_CHAIN_ID: '30', // Rootstock mainnet chain ID
            NEXT_PUBLIC_NODE_URL: 'https://public-node.rsk.co', // Mainnet RPC
            NEXT_PUBLIC_BLOCKSCOUT_URL: 'https://rootstock.blockscout.com',
            // Token addresses (Rootstock mainnet - checksummed)
            // Verified from .env.mainnet and Uniswap V3 pool (https://oku.trade/uniswap/v3/pool/rootstock/0x134f5409cf7af4c68bf4a8f59c96cf4925f6bbb0)
            NEXT_PUBLIC_RIF_ADDRESS: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
            NEXT_PUBLIC_USDRIF_ADDRESS: '0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37', // From .env.mainnet - required for swap tests
            NEXT_PUBLIC_USDT0_ADDRESS: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736', // From Uniswap V3 pool token1 - required for swap tests
            // DEX Router addresses (Rootstock mainnet)
            // Verified from Uniswap Governance: https://gov.uniswap.org/t/official-uniswap-v3-deployments-list/24323
            NEXT_PUBLIC_UNISWAP_QUOTER_V2_ADDRESS: '0xb51727c996C68E60F598A923a5006853cd2fEB31',
            NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER_ADDRESS: '0x244f68e77357f86a8522323eBF80b5FC2F814d3E',
            NEXT_PUBLIC_ICECREAMSWAP_ROUTER_ADDRESS: '0x63d3C7Ab37ca36A2A0A338076C163fF60c72527c',
            // Pool addresses (Rootstock mainnet - checksummed)
            NEXT_PUBLIC_USDT0_USDRIF_POOL_ADDRESS: '0x134F5409cf7AF4C68bF4A8f59C96CF4925f6Bbb0',
          },
        },
      },
      // Fork project only runs when FORK_RPC_URL is set (avoids localhost:8545 timeout in CI)
      ...(hasForkRpc ? [forkProject] : []),
    ],
  },
})
