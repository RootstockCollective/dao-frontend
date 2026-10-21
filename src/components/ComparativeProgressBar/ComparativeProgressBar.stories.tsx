import type { Meta, StoryObj } from '@storybook/nextjs'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'

const meta = {
  title: 'Components/ComparativeProgressBar',
  component: ComparativeProgressBar,
} satisfies Meta<typeof ComparativeProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    'aria-label': 'For 33%, against 33%, abstain 33%',
    values: [
      { value: 10, color: 'var(--st-success)' },
      { value: 10, color: 'var(--st-error)' },
      { value: 10, color: 'var(--st-info)' },
    ],
  },
}

export const FiftyFifty: Story = {
  args: {
    'aria-label': 'For 50%, against 50%',
    values: [
      { value: 50, color: 'var(--st-success)' },
      { value: 50, color: 'var(--st-error)' },
    ],
  },
}

export const AbstainWinning: Story = {
  args: {
    'aria-label': 'For 8%, against 8%, abstain 84%',
    values: [
      { value: 10, color: 'var(--st-success)' },
      { value: 10, color: 'var(--st-error)' },
      { value: 109, color: 'var(--text-light)' },
    ],
  },
}
