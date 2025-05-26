import type { Meta, StoryObj } from '@storybook/react'
import { BuilderActionButton } from './BuilderActionButton'

const meta: Meta<typeof BuilderActionButton> = {
  title: 'Backing/BuilderActionButton',
  component: BuilderActionButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BuilderActionButton>

export const CustomAction: Story = {
  args: {
    text: 'Custom action',
    onClick: () => console.log('Custom action clicked'),
  },
}
