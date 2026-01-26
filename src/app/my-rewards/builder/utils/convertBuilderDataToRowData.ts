import { TransactionHistoryItem } from '@/app/my-rewards/tx-history/utils/types'
import { TransactionHistoryTable } from '../components/BuilderTransactionHistoryTable.config'
import { Duration } from 'luxon'
import { GetPricesResult } from '@/app/user/types'
import { TOKENS_BY_ADDRESS } from '@/lib/tokens'
import Big from 'big.js'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { Address, getAddress } from 'viem'
import { formatCurrency } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import { calculateCycleNumber, formatDateRange } from '@/app/my-rewards/tx-history/utils/utils'

/**
 * Converts builder transaction history data to row data format.
 * Simplified version that only handles Claim transactions (builder's own claims).
 * Groups transactions by blockHash to consolidate multiple token claims in one tx.
 */
export const convertBuilderDataToRowData = (
  data: TransactionHistoryItem[],
  cycleDuration: Duration,
  prices: GetPricesResult,
  builder?: Builder,
): TransactionHistoryTable['Row'][] => {
  if (!data.length) return []

  // Group transactions by transactionHash (multiple token claims in one tx)
  const groupedByTransactionHash = data.reduce<Record<string, TransactionHistoryItem[]>>((acc, item) => {
    if (!acc[item.transactionHash]) {
      acc[item.transactionHash] = []
    }
    acc[item.transactionHash].push(item)
    return acc
  }, {})

  const rows: TransactionHistoryTable['Row'][] = []

  Object.entries(groupedByTransactionHash).forEach(([transactionHash, items]) => {
    const firstItem = items[0]
    const builderAddress = getAddress(firstItem.builder)
    const cycleNumber = calculateCycleNumber(firstItem.cycleStart, cycleDuration)
    const dateRange = formatDateRange(firstItem.cycleStart, cycleDuration)

    // Single transaction - no grouping needed
    if (items.length === 1) {
      const item = items[0]
      const amounts: { address: Address; value: string; symbol: string }[] = []
      let totalUsdValue = Big(0)

      if (item.amount && item.rewardToken) {
        const tokenAddress = getAddress(item.rewardToken)
        const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
        const price = prices[symbol]?.price ?? 0
        const itemAmount = BigInt(item.amount)
        amounts.push({ address: item.rewardToken, value: formatSymbol(itemAmount, symbol), symbol })
        totalUsdValue = getFiatAmount(itemAmount, price)
      }

      rows.push({
        id: item.id,
        data: {
          cycle: {
            cycle: cycleNumber.toString(),
          },
          date: {
            timestamp: item.blockTimestamp,
            formatted: dateRange,
            transactionHash: item.transactionHash,
          },
          from_to: {
            builder,
            builderAddress,
            type: 'Claim',
          },
          type: {
            type: 'Claim',
          },
          amount: {
            amounts,
            type: 'Claim',
          },
          total_amount: {
            usd: formatCurrency(totalUsdValue, { showCurrencyLabel: false, showCurrencySymbol: false }),
          },
        },
      })
    } else {
      // Multiple token claims in same transaction - consolidate into single row
      const amountsByToken: Record<Address, { symbol: string; amount: bigint; price: number }> = {}

      items.forEach(item => {
        if (item.amount && item.rewardToken) {
          const tokenAddress = getAddress(item.rewardToken)
          const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
          const price = prices[symbol]?.price ?? 0
          const itemAmount = BigInt(item.amount)

          if (amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress].amount += itemAmount
          } else {
            amountsByToken[tokenAddress] = { symbol, amount: itemAmount, price }
          }
        }
      })

      const amounts: Array<{ address: Address; value: string; symbol: string }> = []
      const usdValues: string[] = []

      Object.entries(amountsByToken).forEach(([address, { symbol, amount, price }]) => {
        amounts.push({ address: address as Address, value: formatSymbol(amount, symbol), symbol })
        const usdAmount = getFiatAmount(amount, price)
        usdValues.push(formatCurrency(usdAmount, { showCurrencyLabel: false, showCurrencySymbol: false }))
      })

      rows.push({
        id: `${transactionHash}-consolidated`,
        data: {
          cycle: {
            cycle: cycleNumber.toString(),
          },
          date: {
            timestamp: firstItem.blockTimestamp,
            formatted: dateRange,
            transactionHash,
          },
          from_to: {
            builder,
            builderAddress,
            type: 'Claim',
          },
          type: {
            type: 'Claim',
          },
          amount: {
            amounts,
            type: 'Claim',
          },
          total_amount: {
            usd: usdValues.length > 1 ? usdValues : usdValues[0],
          },
        },
      })
    }
  })

  return rows
}
