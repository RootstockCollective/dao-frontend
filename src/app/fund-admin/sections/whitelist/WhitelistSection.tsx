import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { TableProvider } from '@/shared/context'

import { BTCAddWhitelist } from './components/BTCAddWhitelist'
import { BTCWhitelistingHistoryTable } from './components/BTCWhitelistingHistoryTable'
import { type ColumnId, type WhitelistCellDataMap } from './config'
import { BTC_VAULT_WHITELISTED_USERS_QUERY_KEY } from './hooks/useGetBTCWhitelistingHistory'

export const WhitelistSection = () => {
  const queryClient = useQueryClient()

  const refetchWhitelistTable = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: [...BTC_VAULT_WHITELISTED_USERS_QUERY_KEY],
      type: 'all',
    })
  }, [queryClient])

  return (
    <>
      <div className="p-6 bg-bg-80">
        <BTCAddWhitelist onGrantSuccess={refetchWhitelistTable} />
      </div>
      <div className="p-6 pt-4 bg-bg-80">
        <TableProvider<ColumnId, WhitelistCellDataMap>>
          <BTCWhitelistingHistoryTable onWhitelistDataChange={refetchWhitelistTable} />
        </TableProvider>
      </div>
    </>
  )
}
