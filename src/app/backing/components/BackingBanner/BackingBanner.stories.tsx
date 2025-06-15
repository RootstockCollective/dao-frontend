import type { Meta, StoryObj } from '@storybook/react'
import { BackingBanner } from './BackingBanner'

const meta = {
  title: 'Koto/Backing/Container/BackingBanner',
  component: BackingBanner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BackingBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithCustomStyling: Story = {
  args: {
    className: 'rounded-lg shadow-lg',
  },
}
