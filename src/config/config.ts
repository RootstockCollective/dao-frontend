import { ENV } from '@/lib/constants'
import { Chain, defineChain } from 'viem'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { rootstock, rootstockTestnet } from '@reown/appkit/networks'
import { createConfig, http, cookieStorage, createStorage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { REOWN_PROJECT_ID } from '@/lib/constants'
import { trezorWalletConnector } from '@/shared/trezor-connector/trezor-connector'

const connectors = [injected(), trezorWalletConnector()]

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

export const config = createConfig({
  chains: [currentEnvChain],
  transports: {
    [currentEnvChain.id]: http(undefined, {
      batch: {
        // this is the default value configured in RSKj
        batchSize: 100,
      },
    }),
  },
})

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: REOWN_PROJECT_ID,
  networks: [currentEnvChain],
  transports: {
    [currentEnvChain.id]: http(undefined, {
      batch: {
        // this is the default value configured in RSKj
        batchSize: 100,
      },
    }),
  },
  connectors,
})

export const wagmiAdapterConfig = wagmiAdapter.wagmiConfig
