'use client'

import { useCallback, useState } from 'react'

import { SolidTabs } from '@/components/Tabs'

const ADMIN_TABS = ['Whitelist', 'Vault controls', 'Audit log'] as const
type AdminTab = (typeof ADMIN_TABS)[number]

export function TabsSection() {
  const [activeTab, setActiveTab] = useState<AdminTab>(ADMIN_TABS[0])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as AdminTab)
  }, [])

  return (
    <SolidTabs
      tabs={[...ADMIN_TABS]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      className="w-full [&_button:nth-child(2)]:min-w-[120px]"
      variant="muted"
    >
      <div className="mt-6 p-6 pt-4 bg-bg-80 rounded-sm">
        {activeTab === 'Whitelist' && 'Whitelist table'}
        {activeTab === 'Vault controls' && 'Vault controls'}
        {activeTab === 'Audit log' && 'Audit log table'}
      </div>
    </SolidTabs>
  )
}
