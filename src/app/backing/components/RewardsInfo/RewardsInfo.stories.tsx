import { RewardsInfo, RewardsInfoProps } from './RewardsInfo'
import type { Meta, StoryObj } from '@storybook/react'
import { FC } from 'react'
import { WeiPerEther } from '@/lib/constants'

// Simple wrapper to convert numbers to BigInt
const RewardsInfoWrapper: FC<
  Omit<RewardsInfoProps, 'current' | 'next' | 'cooldownEndTime'> & {
    current: number
    next: number
    cooldownEndTime: number
  }
> = ({ current, next, cooldownEndTime, ...props }) => (
  <RewardsInfo
    current={(BigInt(current) * WeiPerEther) / 100n}
    next={(BigInt(next) * WeiPerEther) / 100n}
    cooldownEndTime={BigInt(cooldownEndTime)}
    {...props}
  />
)

const meta: Meta<typeof RewardsInfoWrapper> = {
  title: 'Backing/RewardsInfo',
  component: RewardsInfoWrapper,
}

export default meta
type Story = StoryObj<typeof RewardsInfoWrapper>

const defaultArgs = {
  current: 50,
  next: 50,
  cooldownEndTime: 1717987200,
}

export const Default: Story = {
  args: defaultArgs,
}

export const WithEstimatedRewards: Story = {
  args: {
    ...defaultArgs,
    estimatedRewards: {
      rif: {
        amount: {
          value: 300000000000000000000n, // 300 RIF in wei
          price: 1,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n,
          price: 0,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    },
  },
}

export const WithIncreaseNextRewardPct: Story = {
  args: {
    ...defaultArgs,
    next: 60,
    estimatedRewards: {
      rif: {
        amount: {
          value: 300000000000000000000n, // 300 RIF in wei
          price: 1,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n,
          price: 0,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    },
  },
}

export const WithDecreaseNextRewardPct: Story = {
  args: {
    ...defaultArgs,
    next: 40,
    estimatedRewards: {
      rif: {
        amount: {
          value: 300000000000000000000n, // 300 RIF in wei
          price: 1,
          symbol: 'RIF',
          currency: 'USD',
        },
      },
      rbtc: {
        amount: {
          value: 0n,
          price: 0,
          symbol: 'RBTC',
          currency: 'USD',
        },
      },
    },
  },
}
