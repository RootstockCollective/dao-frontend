import { Meta, StoryObj } from '@storybook/react'
import { ProgressBarLoop } from './ProgressBarLoop'

export default {
  title: 'Components/Progress/Loop',
  component: ProgressBarLoop,
} as Meta<typeof ProgressBarLoop>

type Story = StoryObj<typeof ProgressBarLoop>

export const Gradient: Story = {
  render: () => <ProgressBarLoop color="gradient" />,
}
export const Blue: Story = {
  render: () => <ProgressBarLoop color="blue" />,
}
export const CustomColor: Story = {
  render: () => (
    <ProgressBarLoop
      color={[
        ['#ff0000', '#ff00ff'],
        ['#00ff00', '#0000ff'],
      ]}
    />
  ),
}
