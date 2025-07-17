import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SolidTabs } from './SolidTabs'

const meta = {
  title: 'KOTO/DAO/SolidTabs',
  component: SolidTabs,
} satisfies Meta<typeof SolidTabs>

export default meta

type Story = StoryObj<typeof meta>

const tabs = ['Grants', 'Growth', 'General']

export const Default: Story = {
  args: {
    activeTab: 'Grants',
    onTabChange: () => {},
    tabs,
  },
  render: () => {
    const [activeTab, setActiveTab] = useState<string>('Grants')

    return (
      <div className="bg-bg-80 p-4">
        <SolidTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
          <div className="py-4">
            <p className="text-white">Content for {activeTab} tab</p>
          </div>
        </SolidTabs>
      </div>
    )
  },
}
