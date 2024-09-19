import { Footer } from '@/components/Footer/Footer'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/Footer',
  component: Footer,
} satisfies Meta<typeof Footer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    brand: 'RootstockLabs',
  },
}
