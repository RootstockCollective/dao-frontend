import { Meta, StoryObj } from '@storybook/react'
import { ProgressBarLoop } from './ProgressBarLoop'

export default {
  title: 'Components/Progress/Loop',
  component: ProgressBarLoop,
} as Meta<typeof ProgressBarLoop>

type Story = StoryObj<typeof ProgressBarLoop>

export const Default: Story = {
  render: () => <ProgressBarLoop />,
}
