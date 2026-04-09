import 'react-toastify/dist/ReactToastify.css'
import './../src/app/globals.css'

import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { Preview } from '@storybook/nextjs'
import { ToastContainer } from 'react-toastify'
import { http } from 'viem'
import { createConfig, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

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
        <TooltipProvider>
          <Story />
          <ToastContainer />
        </TooltipProvider>
      </WagmiProvider>
    ),
  ],
  tags: ['autodocs'],
}

export default preview
