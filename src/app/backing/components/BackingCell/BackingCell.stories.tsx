import type { Meta, StoryObj } from '@storybook/react'
import { BackingCell } from './BackingCell'
import { AllocationsContextProvider } from '@/app/collective-rewards/allocations/context'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { http } from 'viem'

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

const queryClient = new QueryClient()

const meta: Meta<typeof BackingCell> = {
  title: 'Components/BackingCell',
  component: BackingCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <PricesContextProvider>
            <AllocationsContextProvider>
              <Story />
            </AllocationsContextProvider>
          </PricesContextProvider>
        </WagmiConfig>
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    builderAddress: {
      description: 'The address of the builder to show allocation for',
    },
    title: {
      description: 'Optional ReactNode to display as additional metric information',
    },
    state: {
      description: 'The state of the backing cell',
      control: { type: 'select' },
      options: ['activated', 'changing', 'deactivated'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    builderAddress: '0x1234567890123456789012345678901234567890',
    title: 'My Backing',
  },
}

export const WithState: Story = {
  args: {
    builderAddress: '0x1234567890123456789012345678901234567890',
    title: 'My Backing',
    state: 'activated',
  },
}

export const Changing: Story = {
  args: {
    builderAddress: '0x1234567890123456789012345678901234567890',
    title: 'My Backing',
    state: 'changing',
  },
}

export const Deactivated: Story = {
  args: {
    builderAddress: '0x1234567890123456789012345678901234567890',
    title: 'My Backing',
    state: 'deactivated',
  },
}
