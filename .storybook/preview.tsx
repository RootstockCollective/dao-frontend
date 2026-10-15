import 'react-toastify/dist/ReactToastify.css'
import './../src/app/globals.css'

import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { Preview } from '@storybook/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { http } from 'viem'
import { createConfig, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { ConnectWalletProvider } from '../src/shared/walletConnection/connection/ConnectWalletProvider'

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

// Add BigInt serialization
const originalJSONStringify = JSON.stringify
JSON.stringify = function (value, replacer, space) {
  const customReplacer = (key: string, value: unknown) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }
  return originalJSONStringify(value, customReplacer, space)
}

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: 'var(--background)',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    Story => (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectWalletProvider>
            <TooltipProvider>
              <Story />
              <ToastContainer />
            </TooltipProvider>
          </ConnectWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    ),
  ],
  tags: ['autodocs'],
}

export default preview
