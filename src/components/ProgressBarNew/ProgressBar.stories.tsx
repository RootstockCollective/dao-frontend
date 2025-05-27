import { Meta, StoryObj } from '@storybook/react'
import { AnimatedTiles } from './AnimatedTiles'
import { ProgressBar } from './ProgressBar'
import { ProgressButton } from './ProgressButton'

export default {
  title: 'Components/ProgressBar',
  component: AnimatedTiles,
} as Meta<typeof AnimatedTiles>

type Story = StoryObj<typeof AnimatedTiles>

export const Button: Story = {
  render: () => (
    <ProgressButton>
      <p className="font-rootstock-sans text-sm">In Progress - 2 mins average</p>
    </ProgressButton>
  ),
}

export const Bar: Story = {
  render: () => <ProgressBar />,
}
