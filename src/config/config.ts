import { ledgerConnector } from '@/config/ledgerConnector'
import { ENV, NODE_URL, REOWN_PROJECT_ID } from '@/lib/constants'
import { trezorWalletConnector } from '@/shared/trezor-connector/trezor-connector'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { rootstock, rootstockTestnet } from '@reown/appkit/networks'
import { Chain, defineChain } from 'viem'
import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

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

const envChains = {
  mainnet: rootstock,
  testnet: rootstockTestnet,
  regtest: rskRegtest,
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
  storage: createStorage<Record<string, unknown>>({
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
