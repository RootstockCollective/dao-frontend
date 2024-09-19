import type { Meta, StoryObj } from '@storybook/react'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'

const meta = {
  title: 'Components/ComparativeProgressBar',
  component: ComparativeProgressBar,
} satisfies Meta<typeof ComparativeProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    values: [
      { value: 10, color: 'var(--st-success)' },
      { value: 10, color: 'var(--st-error)' },
      { value: 10, color: 'var(--st-info)' },
    ],
  },
}

export const FiftyFifty: Story = {
  args: {
    values: [
      { value: 50, color: 'var(--st-success)' },
      { value: 50, color: 'var(--st-error)' },
    ],
  },
}

export const AbstainWinning: Story = {
  args: {
    values: [
      { value: 10, color: 'var(--st-success)' },
      { value: 10, color: 'var(--st-error)' },
      { value: 109, color: 'var(--text-light)' },
    ],
  },
}
