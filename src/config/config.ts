import { createClient, defineChain } from 'viem'
import { rootstockTestnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

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
  chains: [rskRegtest, rootstockTestnet],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
  connectors: [metaMask({ dappMetadata: { name: 'RootstockCollective' } })],
})
