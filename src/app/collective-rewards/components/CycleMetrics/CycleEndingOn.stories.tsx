import { CycleEndingOn } from './CycleEndingOn'
import type { Meta, StoryObj } from '@storybook/react'
import { DateTime } from 'luxon'

const meta: Meta<typeof CycleEndingOn> = {
  title: 'CollectiveRewards/CycleEndingOn',
  component: CycleEndingOn,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    cycleNext: {
      control: { type: 'date' },
      description: 'The date when the cycle ends',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the component is in loading state',
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof CycleEndingOn>

export const Default: Story = {
  args: {
    cycleNext: DateTime.now().plus({ days: 7 }),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    cycleNext: DateTime.now().plus({ days: 7 }),
    isLoading: true,
  },
}

export const NearEnd: Story = {
  args: {
    cycleNext: DateTime.now().plus({ hours: 12 }),
    isLoading: false,
  },
}

export const FarEnd: Story = {
  args: {
    cycleNext: DateTime.now().plus({ weeks: 2 }),
    isLoading: false,
  },
}

export const DifferentMonth: Story = {
  args: {
    cycleNext: DateTime.now().plus({ months: 1 }),
    isLoading: false,
  },
}

export const DifferentYear: Story = {
  args: {
    cycleNext: DateTime.now().plus({ years: 1 }),
    isLoading: false,
  },
}
