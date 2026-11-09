import type { Meta, StoryObj } from '@storybook/nextjs'

import { CapitalAllocationSection } from './CapitalAllocationSection'

const meta = {
  title: 'BTC Vault/CapitalAllocationSection',
  component: CapitalAllocationSection,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className="w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CapitalAllocationSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
