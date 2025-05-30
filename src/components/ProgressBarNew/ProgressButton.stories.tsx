import { Meta, StoryObj } from '@storybook/react'
import { ProgressButton } from './ProgressButton'

export default {
  title: 'Components/Progress/Button',
  component: ProgressButton,
} as Meta<typeof ProgressButton>

type Story = StoryObj<typeof ProgressButton>

export const Default: Story = {
  render: () => (
    <ProgressButton>
      <p className="font-rootstock-sans text-sm">In Progress - 2 mins average</p>
    </ProgressButton>
  ),
}
export const CustomColors: Story = {
  render: () => (
    <ProgressButton
      color={[
        ['#ff0000', '#ff00ff'],
        ['#00ff00', '#0000ff'],
      ]}
      tileSize={10}
      className="w-full max-w-[200px] h-10"
    >
      <p className="font-rootstock-sans text-xs text-center">In Progress - 2 mins average</p>
    </ProgressButton>
  ),
}
