import type { Address } from 'viem'

import type { BtcVaultWhitelistedUserItem } from '@/app/api/btc-vault/v1/whitelist-role-history/action'
import { formatDateMonthFirst } from '@/app/btc-vault/services/ui/formatters'
import { shortAddress } from '@/lib/utils'
import type { Row } from '@/shared/context/TableContext/types'

import type { ColumnId, WhitelistCellDataMap, WhitelistStatus } from './config'

function subgraphStatusToRowStatus(status: string): WhitelistStatus {
  const s = status.toUpperCase()
  if (s === 'DEWHITELISTED') return 'De-whitelisted'
  return 'Whitelisted'
}

export function convertDataToRowData(
  items: BtcVaultWhitelistedUserItem[] | undefined,
): Row<ColumnId, string, WhitelistCellDataMap>[] {
  if (!items?.length) return []
  return items.map(item => ({
    id: item.id,
    data: {
      address: shortAddress(item.account as Address),
      institution: '—',
      date: formatDateMonthFirst(item.lastUpdated),
      status: subgraphStatusToRowStatus(item.status),
      fullAddress: item.account,
      actions: null,
    },
  }))
}
