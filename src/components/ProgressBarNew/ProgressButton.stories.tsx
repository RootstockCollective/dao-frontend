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
