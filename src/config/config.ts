import { ENV } from '@/lib/constants'
import { defineChain } from 'viem'
import { rootstockTestnet, rootstock } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const rskRegtest = defineChain({
  id: 33,
  name: 'RSK Regtest',
  nativeCurrency: { name: 'tRBTC', symbol: 'tRBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.REGTEST_URL || 'http://localhost:4444'],
    },
  },
})

export const config = createConfig({
  chains: [rskRegtest, rootstockTestnet, rootstock],
  transports: {
    [rootstock.id]: http(),
    [rootstockTestnet.id]: http(),
    [rskRegtest.id]: http(),
  },
  connectors: [injected()],
})

export const supportedChainId = {
  mainnet: rootstock.id,
  testnet: rootstockTestnet.id,
  regtest: rskRegtest.id,
}[ENV]!
