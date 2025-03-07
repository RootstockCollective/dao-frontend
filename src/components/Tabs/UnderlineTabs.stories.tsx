import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { UnderlineTabs, type BaseTab } from './UnderlineTabs'

const meta = {
  title: 'Components/Tabs/UnderlineTabs',
  component: UnderlineTabs,
} satisfies Meta<typeof UnderlineTabs>

export default meta

type Story = StoryObj<typeof meta>

const tabs = [
  { value: '1', label: 'Grant' },
  { value: '2', label: 'Growth' },
  { value: '3', label: 'General' },
  { value: '4', label: 'Hello' },
  { value: '5', label: 'World' },
] as const satisfies BaseTab[]

export const Default: Story = {
  args: {
    activeTab: 'growth',
    onTabChange: () => {},
    tabs,
  },
  render: () => {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['value']>('1')

    return <UnderlineTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} layoutId="default" />
  },
}

const stringTabs = [
  { value: 'Grant' },
  { value: 'Growth' },
  { value: 'General' },
] as const satisfies BaseTab[]

export const StringTabs: Story = {
  args: {
    activeTab: 'Grant',
    onTabChange: () => {},
    tabs: stringTabs,
  },
  render: () => {
    const [activeTab, setActiveTab] = useState<(typeof stringTabs)[number]['value']>('Grant')

    return (
      <UnderlineTabs tabs={stringTabs} activeTab={activeTab} onTabChange={setActiveTab} layoutId="strings" />
    )
  },
}
