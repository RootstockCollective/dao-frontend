import { createClient, defineChain } from 'viem'
import { createConfig, http } from 'wagmi'
import { injected, metaMask, safe } from 'wagmi/connectors'

const rskMainnet = defineChain({
  id: 30,
  name: 'RSK Mainnet',
  nativeCurrency: { name: 'RSK', symbol: 'RSK', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://public-node.rsk.co'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: 'https://explorer.rsk.co',
    },
  },
})

const rskTestnet = defineChain({
  id: 31,
  name: 'RSK Testnet',
  nativeCurrency: { name: 'RSK', symbol: 'RSK', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://public-node.testnet.rsk.co'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSK Testnet Explorer',
      url: 'https://explorer.testnet.rsk.co',
    },
  },
})

const rskLocalhost = defineChain({
  id: 1337,
  name: 'RSK Localhost',
  nativeCurrency: { name: 'RSK', symbol: 'RSK', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
})

export const config = createConfig({
  chains: [rskMainnet, rskTestnet, rskLocalhost],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
  connectors: [metaMask()],
})
