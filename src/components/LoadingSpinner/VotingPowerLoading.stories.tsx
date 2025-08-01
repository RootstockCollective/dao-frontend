import type { Meta, StoryObj } from '@storybook/react'
import { VotingPowerLoading } from './VotingPowerLoading'

const meta = {
  title: 'Components/LoadingSpinner/VotingPowerLoading',
  component: VotingPowerLoading,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof VotingPowerLoading>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
