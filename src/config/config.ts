import { createClient, defineChain } from 'viem'
import { rootstockTestnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

const rskLocalhost = defineChain({
  id: 1337,
  name: 'RSK Localhost',
  nativeCurrency: { name: 'RBTC', symbol: 'RBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
})

export const config = createConfig({
  chains: [rootstockTestnet, rskLocalhost],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
  connectors: [metaMask({ dappMetadata: { name: 'RootstockCollective' } })],
})
