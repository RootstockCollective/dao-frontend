import { FooterDesktop } from '@/components/Footer/FooterDesktop'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Components/FooterDesktop',
  component: FooterDesktop,
} satisfies Meta<typeof FooterDesktop>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    brand: 'RootstockLabs',
  },
}
