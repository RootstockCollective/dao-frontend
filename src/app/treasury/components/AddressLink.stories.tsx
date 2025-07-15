import type { Meta, StoryObj } from '@storybook/react'
import { AddressLink } from './AddressLink'

const meta: Meta<typeof AddressLink> = {
  title: 'Treasury/AddressLink',
  component: AddressLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AddressLink>

export const Default: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
  },
}

export const WithCustomClassName: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
    className: 'bg-bg-60 p-4 rounded-lg',
  },
}
