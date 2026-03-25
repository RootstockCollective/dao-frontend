'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { BTCAddWhitelist } from '@/app/fund-admin/components/BTCGrantWhitelist'
import { BTCWhitelistingHistoryTable } from '@/app/fund-admin/components/BTCWhitelistingHistoryTable'
import type {
  ColumnId,
  WhitelistCellDataMap,
} from '@/app/fund-admin/components/BTCWhitelistingHistoryTable.config'
import { SolidTabs } from '@/components/Tabs'
import { TableProvider } from '@/shared/context'

import { BTC_VAULT_WHITELISTED_USERS_QUERY_KEY } from '../hooks/useGetBTCWhitelistingHistory'

const ADMIN_TABS = ['Whitelist', 'Vault controls', 'Audit log'] as const
type AdminTab = (typeof ADMIN_TABS)[number]

export function TabsSection() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<AdminTab>(ADMIN_TABS[0])

  const refetchWhitelistTable = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: [...BTC_VAULT_WHITELISTED_USERS_QUERY_KEY],
      type: 'all',
    })
  }, [queryClient])

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
      {activeTab === 'Whitelist' && (
        <div className="mt-6 p-6 bg-bg-80 rounded-sm">
          <BTCAddWhitelist onGrantSuccess={refetchWhitelistTable} />
        </div>
      )}
      <div className="mt-6 p-6 pt-4 bg-bg-80 rounded-sm">
        {activeTab === 'Whitelist' && (
          <TableProvider<ColumnId, WhitelistCellDataMap>>
            <BTCWhitelistingHistoryTable onWhitelistDataChange={refetchWhitelistTable} />
          </TableProvider>
        )}
        {activeTab === 'Vault controls' && 'Vault controls'}
        {activeTab === 'Audit log' && 'Audit log table'}
      </div>
    </SolidTabs>
  )
}
