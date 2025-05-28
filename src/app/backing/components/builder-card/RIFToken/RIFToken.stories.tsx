import type { Meta, StoryObj } from '@storybook/react'
import { RIFToken } from './RIFToken'

const meta: Meta<typeof RIFToken> = {
  title: 'Backing/RIFToken',
  component: RIFToken,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RIFToken>

export const Default: Story = {
  args: {},
}
