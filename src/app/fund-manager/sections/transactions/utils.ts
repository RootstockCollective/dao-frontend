import type { Address } from 'viem'

import type { RequestType } from '@/app/btc-vault/services/types'
import { formatDateMonthFirst } from '@/app/btc-vault/services/ui/formatters'
import { getTxHistoryStatusLabel } from '@/app/btc-vault/services/ui/mappers'
import type { DisplayStatus } from '@/app/btc-vault/services/ui/types'
import type { BtcVaultEntityHistoryRow } from '@/app/fund-manager/sections/transactions/hooks/useGetBtcVaultEntitiesHistory'
import Big from '@/lib/big'
import { RBTC, WeiPerEther } from '@/lib/constants'
import { formatCurrency, formatCurrencyWithLabel, shortAddress } from '@/lib/utils'
import type { Row } from '@/shared/context'

import type { ColumnId, DepositWindowCellDataMap } from './config'

const DEFAULT_DISPLAY_STATUS: DisplayStatus = 'pending'

function getRequestType(action: string): RequestType {
  const normalizedAction = action.toUpperCase()
  return normalizedAction.includes('DEPOSIT') ? 'deposit' : 'withdrawal'
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
    const fiatAmountFormatted = rbtcPrice > 0 ? formatCurrencyWithLabel(amount.mul(rbtcPrice)) : null

    const displayStatus = item.displayStatus ?? DEFAULT_DISPLAY_STATUS
    const displayStatusLabel = getTxHistoryStatusLabel(displayStatus, requestType)

    return {
      id: item.id,
      data: {
        date: formatDateMonthFirst(item.timestamp),
        investor: shortUserAddress,
        entity: shortUserAddress,
        type: typeLabel,
        amount: amountFormatted,
        status: displayStatus,
        displayStatusLabel,
        fiatAmountFormatted,
        tokenSymbol: RBTC,
        user: item.user,
        requestType,
        timestamp: item.timestamp,
      },
    }
  })
}
