import { CycleNumber } from './CycleNumber'
import type { Meta, StoryObj } from '@storybook/react'
import { DateTime, Duration } from 'luxon'

const meta: Meta<typeof CycleNumber> = {
  title: 'CollectiveRewards/CycleNumber',
  component: CycleNumber,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays the current cycle number based on the first cycle start date and cycle duration. Shows a loading spinner when data is being fetched.',
      },
    },
  },
  argTypes: {
    duration: {
      control: { type: 'object' },
      description: 'The duration of each cycle (Luxon Duration object)',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the component is in a loading state',
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof CycleNumber>

export const Default: Story = {
  args: {
    duration: Duration.fromObject({ days: 7 }),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    duration: Duration.fromObject({ days: 7 }),
    isLoading: false,
  },
  render: args => (
    <div className="w-96">
      <CycleNumber {...args} />
    </div>
  ),
}

export const WeeklyCycle: Story = {
  args: {
    duration: Duration.fromObject({ days: 7 }),
    isLoading: false,
    firstCycleStartDate: DateTime.now().minus({ days: 10 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cycle with 7-day duration (weekly cycles) and first cycle started 10 days ago',
      },
    },
  },
}

export const BiweeklyCycle: Story = {
  args: {
    duration: Duration.fromObject({ days: 14 }),
    isLoading: false,
    firstCycleStartDate: DateTime.now().minus({ days: 10 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cycle with 14-day duration (biweekly cycles) and first cycle started 10 days ago',
      },
    },
  },
}

export const MonthlyCycle: Story = {
  args: {
    duration: Duration.fromObject({ days: 30 }),
    isLoading: false,
    firstCycleStartDate: DateTime.now().minus({ days: 80 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cycle with 30-day duration (monthly cycles) and first cycle started 80 days ago',
      },
    },
  },
}

export const ShortCycle: Story = {
  args: {
    duration: Duration.fromObject({ days: 1 }),
    isLoading: false,
    firstCycleStartDate: DateTime.now().minus({ days: 365 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cycle with 1-day duration (daily cycles) and first cycle started 365 days ago',
      },
    },
  },
}

export const LongCycle: Story = {
  args: {
    duration: Duration.fromObject({ days: 90 }),
    isLoading: false,
    firstCycleStartDate: DateTime.now().minus({ days: 91 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cycle with 90-day duration (quarterly cycles) and first cycle started 91 days ago',
      },
    },
  },
}

export const WithHours: Story = {
  args: {
    duration: Duration.fromObject({ days: 7, hours: 12 }),
    isLoading: false,
    firstCycleStartDate: DateTime.now().minus({ days: 8 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cycle with 7 days and 12 hours duration and first cycle started 8 days ago',
      },
    },
  },
}
