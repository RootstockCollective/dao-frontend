import type { Meta, StoryObj } from '@storybook/nextjs'
import { Countdown } from './Countdown'
import { TimeSource } from './types'
import Big from '@/lib/big'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const meta: Meta<typeof Countdown> = {
  title: 'Components/Countdown',
  component: Countdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    timeSource: {
      control: { type: 'select' },
      options: ['blocks', 'timestamp'] as TimeSource[],
    },
    colorDirection: {
      control: { type: 'select' },
      options: ['normal', 'reversed'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Timestamp-based countdown with colors (green - lots of time remaining)
export const TimestampBasedWithColors: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
    timeSource: 'timestamp' as TimeSource,
    referenceStart: Big(Math.floor(Date.now() / 1000)), // 24h total period
    colorDirection: 'normal',
  },
}

// Timestamp-based countdown without colors
export const TimestampBasedWithoutColors: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
    timeSource: 'timestamp' as TimeSource,
  },
}

// Timestamp-based countdown with reversed colors (red - lots of time remaining)
export const TimestampBasedReversedColors: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
    timeSource: 'timestamp' as TimeSource,
    referenceStart: Big(Math.floor(Date.now() / 1000)), // 24 hours total period
    colorDirection: 'reversed',
  },
}
