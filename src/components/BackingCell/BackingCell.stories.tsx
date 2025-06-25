import type { Meta, StoryObj } from '@storybook/react'
import { BackingCell } from './BackingCell'

const meta: Meta<typeof BackingCell> = {
  title: 'Components/BackingCell',
  component: BackingCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
