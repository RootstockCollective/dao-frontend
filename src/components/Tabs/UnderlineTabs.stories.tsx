import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { UnderlineTabs, type Tab } from './UnderlineTabs'

const meta = {
  title: 'Components/Tabs/UnderlineTabs',
  component: UnderlineTabs,
} satisfies Meta<typeof UnderlineTabs>

export default meta

type Story = StoryObj<typeof meta>

const tabs = [
  { value: 'grant', label: 'Grant' },
  { value: 'growth', label: 'Growth' },
  { value: 'general', label: 'General' },
  { value: 'hello', label: 'Hello' },
  { value: 'world', label: 'World' },
] as const satisfies Tab[]

export const Default: Story = {
  args: {
    activeTab: 'growth',
    onTabChange: () => {},
    tabs,
  },
  render: () => {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['value']>('growth')

    return <UnderlineTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  },
}
