import { ENV } from '@/lib/constants'
import { defineChain, HttpTransportConfig } from 'viem'
import { rootstock, rootstockTestnet } from 'viem/chains'
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

const httpTransportConfig: HttpTransportConfig = {
  batch: {
    // this is the default value configured in RSKj
    batchSize: 100,
  },
}

export const config = createConfig({
  chains: [rootstock, rootstockTestnet, rskRegtest],
  transports: {
    [rootstock.id]: http(undefined, {
      ...httpTransportConfig,
    }),
    [rootstockTestnet.id]: http(undefined, {
      ...httpTransportConfig,
    }),
    [rskRegtest.id]: http(),
  },
  connectors: [injected()],
})

export const supportedChainId = {
  mainnet: rootstock.id,
  testnet: rootstockTestnet.id,
  regtest: rskRegtest.id,
}[ENV]!
