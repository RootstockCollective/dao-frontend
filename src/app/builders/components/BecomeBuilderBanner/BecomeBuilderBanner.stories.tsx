import type { Meta, StoryObj } from '@storybook/react'
import BecomeBuilderBanner from './BecomeBuilderBanner'

const meta: Meta<typeof BecomeBuilderBanner> = {
  title: 'Builders/BecomeBuilderBanner',
  component: BecomeBuilderBanner,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BecomeBuilderBanner>

export const Default: Story = {}
