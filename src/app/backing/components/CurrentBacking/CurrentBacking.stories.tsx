import { CurrentBacking } from './CurrentBacking'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof CurrentBacking> = {
  title: 'Backing/CurrentBacking',
  component: CurrentBacking,
}

export default meta
type Story = StoryObj<typeof CurrentBacking>

export const Default: Story = {
  args: {
    existentAllocation: 0n,
  },
}

export const WithAllocation: Story = {
  args: {
    existentAllocation: 50000n,
  },
}
