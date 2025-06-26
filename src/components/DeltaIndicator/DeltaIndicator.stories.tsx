import type { Meta, StoryObj } from '@storybook/react'
import { DeltaIndicator } from './DeltaIndicator'

const meta: Meta<typeof DeltaIndicator> = {
  title: 'Components/DeltaIndicator',
  component: DeltaIndicator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    currentPct: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Current percentage value',
    },
    nextPct: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Next percentage value (optional)',
    },
  },
}

export default meta

type Story = StoryObj<typeof DeltaIndicator>

export const PositiveDelta: Story = {
  args: {
    currentPct: 50,
    nextPct: 65,
  },
}

export const NegativeDelta: Story = {
  args: {
    currentPct: 75,
    nextPct: 60,
  },
}
