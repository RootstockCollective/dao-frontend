import type { Address } from 'viem'

import type { BtcVaultEntityHistoryRow } from '@/app/fund-manager/hooks/useGetBtcVaultEntitiesHistory'
import Big from '@/lib/big'
import { formatCurrency, shortAddress } from '@/lib/utils'
import type { Row } from '@/shared/context'

import type { ColumnId, DepositWindowCellDataMap } from './DepositWindowRequestsTable.config'
import type { RequestStatus } from './StatusBadge'

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function normalizeStatus(displayStatus?: string): RequestStatus {
  if (!displayStatus) return 'Pending'
  const value = displayStatus.toLowerCase()

  if (value.includes('ready_to_claim') || value.includes('ready_to_withdraw') || value === 'claimable')
    return 'Open to claim'
  if (value.includes('successful') || value === 'claimed') return 'Successful'
  if (value.includes('cancel')) return 'Cancelled'

  return 'Pending'
}

/**
 * Maps raw API history rows to table row format expected by TableContext.
 * @param data - Raw BTC vault history rows from the API
 * @param rbtcPrice - Current rBTC price in USD for fiat conversion
 */
export function convertDataToRowData(
  data: BtcVaultEntityHistoryRow[] | undefined,
  rbtcPrice: number,
): Row<ColumnId, string, DepositWindowCellDataMap>[] {
  if (!data || data.length === 0) return []

  return data.map(item => {
    const amountBig = Big(item.assets)
    const amountFormatted = formatCurrency(amountBig.div(1e18), { showCurrencySymbol: false })
    const fiatAmount = rbtcPrice > 0 ? formatCurrency(amountBig.div(1e18).mul(rbtcPrice)) : null

    return {
      id: item.id,
      data: {
        date: formatDate(item.timestamp),
        investor: shortAddress(item.user as Address),
        entity: shortAddress(item.user as Address),
        type: item.action.includes('DEPOSIT') ? 'Deposit' : 'Withdrawal',
        amount: amountFormatted,
        status: normalizeStatus(item.displayStatus),
        fiatAmount,
        tokenSymbol: 'RBTC',
        user: item.user,
        requestType: item.action.includes('DEPOSIT') ? 'deposit' : 'withdrawal',
        timestamp: item.timestamp,
      },
    }
  })
}
