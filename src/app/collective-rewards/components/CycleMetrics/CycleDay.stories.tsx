import { CycleDay } from './CycleDay'
import type { Meta, StoryObj } from '@storybook/react'
import { DateTime, Duration } from 'luxon'

const meta: Meta<typeof CycleDay> = {
  title: 'CollectiveRewards/CycleDay',
  component: CycleDay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    cycleStart: {
      control: { type: 'date' },
      description: 'The start date of the cycle',
    },
    duration: {
      control: { type: 'object' },
      description: 'The duration of the cycle',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the component is in loading state',
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof CycleDay>

// Helper function to create DateTime from date string
const createDateTime = (dateString: string) => DateTime.fromISO(dateString)

// Helper function to create Duration from days
const createDuration = (days: number) => Duration.fromObject({ days })

export const Default: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 10 }),
    duration: createDuration(30),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 10 }),
    duration: createDuration(30),
    isLoading: true,
  },
  render: args => (
    <div className="w-96">
      <CycleDay {...args} />
    </div>
  ),
}

export const EarlyInCycle: Story = {
  args: {
    cycleStart: DateTime.now().minus({ hours: 1 }),
    duration: createDuration(14),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when the cycle has just started (day 1 of 30)',
      },
    },
  },
}

export const MidCycle: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 7, hours: 12 }),
    duration: createDuration(14),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in the middle of a cycle (day 15 of 30)',
      },
    },
  },
}

export const LateInCycle: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 13, hours: 59, minutes: 59, seconds: 59 }),
    duration: createDuration(14),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component near the end of a cycle (day 25 of 30)',
      },
    },
  },
}

export const ShortCycle: Story = {
  args: {
    cycleStart: DateTime.now().minus({ hours: 1 }),
    duration: Duration.fromObject({ minutes: 7 }),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component with a short 7-day cycle',
      },
    },
  },
}

export const LongCycle: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 90 }),
    duration: createDuration(120),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component with a long 90-day cycle',
      },
    },
  },
}

export const OneCycleExceeded: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 14, hours: 1 }),
    duration: createDuration(14),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when the cycle duration has been exceeded',
      },
    },
  },
}

export const TwoCyclesExceeded: Story = {
  args: {
    cycleStart: DateTime.now().minus({ days: 29, hours: 1 }),
    duration: createDuration(14),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when the cycle duration has been exceeded',
      },
    },
  },
}
