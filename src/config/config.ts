import { ENV, NODE_URL } from '@/lib/constants'
import { Chain, defineChain } from 'viem'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { rootstock, rootstockTestnet } from '@reown/appkit/networks'
import { createConfig, http, cookieStorage, createStorage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { REOWN_PROJECT_ID } from '@/lib/constants'
import { trezorWalletConnector } from '@/shared/trezor-connector/trezor-connector'
import { ledgerConnector } from '@/config/ledgerConnector'

const rskRegtest = defineChain({
  id: 33,
  name: 'RSK Regtest',
  nativeCurrency: { name: 'tRBTC', symbol: 'tRBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_REGTEST_URL || 'http://localhost:4444'],
    },
  },
})

// Custom chain for local fork - uses Anvil's default chain ID to avoid MetaMask conflicts
const rootstockFork = defineChain({
  id: 31337,
  name: 'Rootstock Mainnet Fork',
  network: 'rootstock-fork',
  nativeCurrency: { name: 'rBTC', symbol: 'rBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_NODE_URL || 'http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rootstock Blockscout',
      url: process.env.NEXT_PUBLIC_BLOCKSCOUT_URL || 'https://rootstock.blockscout.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4249540, // Same as mainnet since it's a fork
    },
  },
})

const envChains = {
  mainnet: rootstock,
  testnet: rootstockTestnet,
  regtest: rskRegtest,
  fork: rootstockFork, // Local fork uses custom chain ID to avoid MetaMask conflicts
} as const

export const currentEnvChain: Chain = envChains[ENV as keyof typeof envChains]

const connectors = [injected(), ledgerConnector({ chainId: currentEnvChain.id }), trezorWalletConnector()]

export const config = createConfig({
  chains: [currentEnvChain],
  transports: {
    [currentEnvChain.id]: http(NODE_URL, {
      batch: {
        // this is the default value configured in RSKj
        batchSize: 100,
      },
    }),
  },
  connectors,
})

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: REOWN_PROJECT_ID,
  networks: [currentEnvChain],
  connectors,
  transports: {
    [currentEnvChain.id]: http(NODE_URL, {
      batch: {
        // this is the default value configured in RSKj
        batchSize: 100,
      },
    }),
  },
})

export const wagmiAdapterConfig = wagmiAdapter.wagmiConfig
