import { BuilderCard } from './BuilderCard'
import type { Meta, StoryObj } from '@storybook/react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

const meta: Meta<typeof BuilderCard> = {
  title: 'Backing/BuilderCard',
  component: BuilderCard,
  decorators: [
    Story => (
      <WagmiProvider config={config}>
        <div className="w-[800px]">
          <Story />
        </div>
      </WagmiProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof BuilderCard>

export const WithBackerNotConnected: Story = {
  args: {
    builderAddress: '0x1234567890abcdef',
    builderName: 'Beefy',
    builderRewardPct: 50,
    maxAllocation: 120000,
    currentAllocation: 90,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithBackerConnected: Story = {
  args: {
    builderAddress: '0x1234567890abcdef',
    builderName: 'Beefy',
    builderRewardPct: 50,
    maxAllocation: 120000,
    currentAllocation: 0,
    topBarColor: '#4FFFE7',
    className: 'w-[200px]',
  },
}

export const WithAllocation: Story = {
  args: {
    builderAddress: '0x1234567890abcdef',
    builderName: 'Beefy',
    builderRewardPct: 50,
    maxAllocation: 120000,
    currentAllocation: 90000,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithBuilderIncreasedRewardPct: Story = {
  args: {
    builderAddress: '0x1234567890abcdef',
    builderName: 'Beefy',
    builderRewardPct: 50,
    builderNextRewardPct: 60,
    maxAllocation: 120000,
    currentAllocation: 0,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  args: {
    builderAddress: '0x1234567890abcdef',
    builderName: 'Beefy',
    builderRewardPct: 50,
    builderNextRewardPct: 40,
    maxAllocation: 120000,
    currentAllocation: 0,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithAllocationPending: Story = {
  args: {
    builderAddress: '0x1234567890abcdef',
    builderName: 'Beefy',
    builderRewardPct: 50,
    maxAllocation: 120000,
    currentAllocation: 9000,
    allocationTxPending: true,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}
