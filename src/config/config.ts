import { ENV } from '@/lib/constants'
import { Chain, defineChain } from 'viem'
import { rootstock, rootstockTestnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
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

const currentEnvChain: Chain = envChains[ENV as keyof typeof envChains]

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
  connectors: [injected()],
})

export const supportedChainId = {
  mainnet: rootstock.id,
  testnet: rootstockTestnet.id,
  regtest: rskRegtest.id,
}[ENV]!
