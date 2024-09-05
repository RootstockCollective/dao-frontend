import { ENV } from '@/lib/constants'
import { headers } from 'next/headers'
import { defineChain } from 'viem'
import { rootstockTestnet, rootstock } from 'viem/chains'
import { createConfig, http, cookieStorage, createStorage, cookieToInitialState } from 'wagmi'
import { injected } from 'wagmi/connectors'

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

export const getConfig = () =>
  createConfig({
    chains: [rootstockTestnet, rskLocalhost, rootstock],
    // https://wagmi.sh/react/guides/ssr
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [rootstock.id]: http(),
      [rootstockTestnet.id]: http(),
      [rskLocalhost.id]: http(),
    },
    connectors: [injected()],
  })

// https://wagmi.sh/react/guides/ssr#_2-hydrate-the-cookie
const WAGMI_STATE_COOKIE = 'wagmi-state'
export const wagmiInitialState = cookieToInitialState(getConfig(), headers().get(WAGMI_STATE_COOKIE))

export const supportedChainId = {
  mainnet: rootstock.id,
  testnet: rootstockTestnet.id,
  localhost: rskLocalhost.id,
}[ENV]!
