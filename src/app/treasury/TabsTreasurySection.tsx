import { useState } from 'react'
import { UnderlineTabs, type BaseTab } from '@/components/Tabs'
import { treasuryContracts } from '@/lib/contracts'
import { useTreasuryContext } from '@/app/treasury/TreasuryContext'

const tabs = [
  { value: 'GRANTS', label: 'Grant' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'GENERAL', label: 'General' },
] as const satisfies BaseTab<keyof typeof treasuryContracts>[]

export function TabsTreasurySection() {
  const { buckets } = useTreasuryContext()
  console.log('🚀 ~ treasuryContracts:', treasuryContracts)
  console.log('🚀 ~ TabsTreasurySection ~ buckets:', buckets)

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['value']>('GRANTS')
  return (
    <div>
      <UnderlineTabs className="py-4" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab}
    </div>
  )
}
