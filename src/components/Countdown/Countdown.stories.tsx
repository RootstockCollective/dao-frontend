import type { Meta, StoryObj } from '@storybook/nextjs'
import { Countdown } from './Countdown'
import { TimeSource } from './types'
import Big from '@/lib/big'

const meta: Meta<typeof Countdown> = {
  title: 'Components/Countdown',
  component: Countdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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

// Block-based countdown stories
export const BlockBasedCountdown: Story = {
  args: {
    end: Big(5000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(3000),
    colorDirection: 'normal',
  },
}

// Timestamp-based countdown stories
export const TimestampBasedCountdown: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
    timeSource: 'timestamp' as TimeSource,
    referenceStart: Big(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
    colorDirection: 'reversed',
  },
}

// Examples with different time remaining
export const LongTimeRemaining: Story = {
  args: {
    end: Big(10000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(5000),
    colorDirection: 'normal',
  },
}

export const MediumTimeRemaining: Story = {
  args: {
    end: Big(10000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(5000),
    colorDirection: 'normal',
  },
}

export const ShortTimeRemaining: Story = {
  args: {
    end: Big(10000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(5000),
    colorDirection: 'normal',
  },
}

export const NoReferenceStart: Story = {
  args: {
    end: Big(5000),
    timeSource: 'blocks' as TimeSource,
    colorDirection: 'normal',
  },
}

export const CustomClassName: Story = {
  args: {
    end: Big(5000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(3000),
    colorDirection: 'normal',
    className: 'text-lg font-bold',
  },
}

// Color direction examples
export const NormalColorDirection: Story = {
  args: {
    end: Big(5000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(3000),
    colorDirection: 'normal', // Green → Yellow → Red
  },
}

export const ReversedColorDirection: Story = {
  args: {
    end: Big(5000),
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(3000),
    colorDirection: 'reversed', // Red → Yellow → Green
  },
}

// Timestamp examples with different color directions
export const TimestampNormalColors: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400),
    timeSource: 'timestamp' as TimeSource,
    referenceStart: Big(Math.floor(Date.now() / 1000) - 86400),
    colorDirection: 'normal', // Green → Yellow → Red
  },
}

export const TimestampReversedColors: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400),
    timeSource: 'timestamp' as TimeSource,
    referenceStart: Big(Math.floor(Date.now() / 1000) - 86400),
    colorDirection: 'reversed', // Red → Yellow → Green
  },
}

// Real-world usage examples
export const VotingCountdown: Story = {
  args: {
    end: Big(5000), // voteEnd
    timeSource: 'blocks' as TimeSource,
    referenceStart: Big(3000), // voteStart
    colorDirection: 'normal',
  },
}

export const ExecutionCountdown: Story = {
  args: {
    end: Big(Math.floor(Date.now() / 1000) + 86400), // proposalEta
    timeSource: 'timestamp' as TimeSource,
    referenceStart: Big(Math.floor(Date.now() / 1000) - 86400), // proposalQueuedTime
    colorDirection: 'reversed',
  },
}
