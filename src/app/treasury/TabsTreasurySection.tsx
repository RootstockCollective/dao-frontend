import { useState } from 'react'
import { UnderlineTabs, type BaseTab } from '@/components/Tabs'

const tabs = [{ value: 'Grant' }, { value: 'Growth' }, { value: 'General' }] as const satisfies BaseTab[]

export function TabsTreasurySection() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['value']>('Grant')
  return (
    <div>
      <UnderlineTabs className="py-4" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab}
    </div>
  )
}
