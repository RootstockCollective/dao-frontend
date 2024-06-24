import { Footer } from '@/components/Footer/Footer'
import { Header } from '@/components/Header'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/Header',
  component: Header
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: '0x3324A6b051cBCb5e140A6c387e0FC07300F9b444',
    shortAddress: '0x33...444'
  }
}
