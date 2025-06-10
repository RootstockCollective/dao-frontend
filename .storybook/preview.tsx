import type { Preview } from "@storybook/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./../src/app/globals.css";
import React from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { TooltipProvider } from '@radix-ui/react-tooltip'

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

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
      <WagmiConfig config={config}>
        <TooltipProvider>
          <Story />
          <ToastContainer />
        </TooltipProvider>
      </WagmiConfig>
    ),
  ],
  tags: ['autodocs'],
}

export default preview;
