import type { Meta, StoryObj } from '@storybook/react'
import { TabsTreasurySection } from './TabsTreasurySection'

const meta = {
  title: 'Components/Tabs/TreasurySection',
  component: TabsTreasurySection,
} satisfies Meta<typeof TabsTreasurySection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
