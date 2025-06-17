import type { Meta, StoryObj } from '@storybook/react'
import BecomeBuilderCollapsible from './BecomeBuilderBanner'

const meta: Meta<typeof BecomeBuilderCollapsible> = {
  title: 'Builders/Components/BecomeBuilderBanner',
  component: BecomeBuilderCollapsible,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BecomeBuilderCollapsible>

export const Default: Story = {}
