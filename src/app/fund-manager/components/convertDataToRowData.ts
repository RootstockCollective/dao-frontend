import type { Address } from 'viem'

import type { RequestType } from '@/app/btc-vault/services/types'
import { getTxHistoryStatusLabel } from '@/app/btc-vault/services/ui/mappers'
import type { DisplayStatus } from '@/app/btc-vault/services/ui/types'
import type { BtcVaultEntityHistoryRow } from '@/app/fund-manager/hooks/useGetBtcVaultEntitiesHistory'
import Big from '@/lib/big'
import { RBTC, WeiPerEther } from '@/lib/constants'
import { formatCurrency, shortAddress } from '@/lib/utils'
import type { Row } from '@/shared/context'

import type { ColumnId, DepositWindowCellDataMap } from './DepositWindowRequestsTable.config'

const DEFAULT_DISPLAY_STATUS: DisplayStatus = 'pending'

function formatDate(timestampInSeconds: number): string {
  return new Date(timestampInSeconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getRequestType(action: string): RequestType {
  return action.includes('DEPOSIT') ? 'deposit' : 'withdrawal'
}

/**
 * Maps raw API history rows to table row format expected by TableContext.
 * @param data Raw BTC vault history rows from the API
 * @param rbtcPrice Current rBTC price in USD for fiat conversion
 */
export function convertDataToRowData(
  data: readonly BtcVaultEntityHistoryRow[] | undefined,
  rbtcPrice: number,
): Row<ColumnId, string, DepositWindowCellDataMap>[] {
  if (!data?.length) return []

  return data.map(item => {
    const requestType = getRequestType(item.action)
    const typeLabel = requestType === 'deposit' ? 'Deposit' : 'Withdrawal'

    const userAddress = item.user as Address
    const shortUserAddress = shortAddress(userAddress)

    const amount = Big(item.assets).div(WeiPerEther.toString())
    const amountFormatted = formatCurrency(amount, { showCurrencySymbol: false })
    const fiatAmount = rbtcPrice > 0 ? formatCurrency(amount.mul(rbtcPrice)) : null

    const displayStatus = (item.displayStatus ?? DEFAULT_DISPLAY_STATUS) as DisplayStatus
    const displayStatusLabel = getTxHistoryStatusLabel(displayStatus, requestType)

    return {
      id: item.id,
      data: {
        date: formatDate(item.timestamp),
        investor: shortUserAddress,
        entity: shortUserAddress,
        type: typeLabel,
        amount: amountFormatted,
        status: displayStatus,
        displayStatusLabel,
        fiatAmount,
        tokenSymbol: RBTC,
        user: item.user,
        requestType,
        timestamp: item.timestamp,
      },
    }
  })
}
