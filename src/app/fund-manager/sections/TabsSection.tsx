'use client'

import { useCallback, useState } from 'react'

import { SolidTabs } from '@/components/Tabs'

const FUND_MANAGER_TABS = ['Transactions', 'NAV History', 'Ongoing'] as const
type FundManagerTab = (typeof FUND_MANAGER_TABS)[number]

/**
 * Tabbed section for Fund Manager: Transactions, NAV History, Ongoing.
 * Uses muted variant for list container and inactive tab styling.
 */
export function TabsSection() {
  const [activeTab, setActiveTab] = useState<FundManagerTab>(FUND_MANAGER_TABS[0])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as FundManagerTab)
  }, [])

  return (
    <SolidTabs
      tabs={[...FUND_MANAGER_TABS]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      className="w-full"
      variant="muted"
    >
      <div className="mt-6 p-6 pt-4 bg-bg-80 rounded-sm">
        {activeTab === 'Transactions' && 'Transactions table'}
        {activeTab === 'NAV History' && 'NAV History table'}
        {activeTab === 'Ongoing' && 'Ongoing table'}
      </div>
    </SolidTabs>
  )
}
