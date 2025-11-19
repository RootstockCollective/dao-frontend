import { TransactionHistoryItem } from '../../utils/types'
import { GroupedTransactionDetail, TransactionHistoryTable } from './TransactionHistoryTable.config'
import { FIRST_CYCLE_START_SECONDS } from '@/app/collective-rewards/constants/chartConstants'
import { Duration } from 'luxon'
import { GetPricesResult } from '@/app/user/types'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { getTokenByAddress, TOKENS } from '@/lib/tokens'
import Big from 'big.js'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'

const calculateCycleNumber = (cycleStartTimestamp: string, cycleDuration: Duration): number => {
  const cycleStartSeconds = Number(cycleStartTimestamp)
  const cycleDurationSeconds = cycleDuration.as('seconds')
  return Math.floor((cycleStartSeconds - FIRST_CYCLE_START_SECONDS) / cycleDurationSeconds) + 1
}

const formatDateRange = (cycleStart: string, cycleDuration: Duration): string => {
  const startDate = new Date(Number(cycleStart) * 1000)
  const endDate = new Date((Number(cycleStart) + cycleDuration.as('seconds')) * 1000 - 1)

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  const startFormatted = startDate.toLocaleDateString('en-US', formatOptions)
  const endFormatted = endDate.toLocaleDateString('en-US', formatOptions)

  // Extract parts for custom formatting
  const startParts = startFormatted.split(', ')
  const endParts = endFormatted.split(', ')
  const [startMonth, startDay] = startParts[0].split(' ')
  const [endMonth, endDay] = endParts[0].split(' ')
  const startYear = startParts[1]
  const endYear = endParts[1]

  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`
  }

  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`
  }

  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
}

export const convertDataToRowData = (
  data: TransactionHistoryItem[],
  cycleDuration: Duration,
  prices: GetPricesResult,
): TransactionHistoryTable['Row'][] => {
  if (!data.length) return []

  const rifPrice = prices[RIF]?.price ?? 0
  const rbtcPrice = prices[RBTC]?.price ?? 0
  const usdrifPrice = prices[USDRIF]?.price ?? 0

  // Group transactions by blockHash
  const groupedByBlock = data.reduce<Record<string, TransactionHistoryItem[]>>((acc, item) => {
    if (!acc[item.blockHash]) {
      acc[item.blockHash] = []
    }
    acc[item.blockHash].push(item)
    return acc
  }, {})

  const rows: TransactionHistoryTable['Row'][] = []

  Object.entries(groupedByBlock).forEach(([blockHash, items]) => {
    if (items.length === 1) {
      // Single transaction - create normal row
      const item = items[0]
      const cycleNumber = calculateCycleNumber(item.cycleStart, cycleDuration)
      const dateRange = formatDateRange(item.cycleStart, cycleDuration)
      const transactionType = item.type

      const amounts: Array<{ address: string; value: string; price: number }> = []
      let totalUsdValue = Big(0)

      if (transactionType === 'Claim' && item.amount && item.rewardToken) {
        const tokenAddress = item.rewardToken
        const token = getTokenByAddress(tokenAddress)
        const symbol = token?.symbol || ''
        const priceMap: Record<string, number> = {
          [RIF]: rifPrice,
          [RBTC]: rbtcPrice,
          [USDRIF]: usdrifPrice,
        }
        const price = priceMap[symbol] || 0

        const formattedAmount = formatSymbol(BigInt(item.amount), symbol)
        amounts.push({ address: tokenAddress, value: formattedAmount, price })

        const usdAmount = getFiatAmount(BigInt(item.amount), price)
        totalUsdValue = totalUsdValue.plus(usdAmount)
      } else if (transactionType === 'Back' && item.allocation) {
        const formattedAmount = formatSymbol(BigInt(item.allocation), TOKENS.strif.symbol)
        amounts.push({ address: tokenContracts.stRIF, value: formattedAmount, price: rifPrice })

        const usdAmount = getFiatAmount(BigInt(item.allocation), rifPrice)
        totalUsdValue = totalUsdValue.plus(usdAmount)
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
          },
          from_to: {
            builderAddress: item.builder,
            type: transactionType,
          },
          type: {
            type: transactionType,
            increased: item.increased,
          },
          amount: {
            amounts: amounts.map(a => ({ address: a.address, value: a.value })),
            type: transactionType,
            increased: item.increased,
          },
          total_amount: {
            usd: totalUsdValue.toFixed(2),
          },
        },
      })
    } else {
      const firstItem = items[0]
      const cycleNumber = calculateCycleNumber(firstItem.cycleStart, cycleDuration)
      const dateRange = formatDateRange(firstItem.cycleStart, cycleDuration)
      const transactionType = firstItem.type

      const amountsByToken: Record<string, { total: Big; price: number }> = {}
      let totalUsdValue = Big(0)
      const groupedDetails: GroupedTransactionDetail[] = []

      items.forEach(item => {
        const itemAmounts: Array<{ address: string; value: string; symbol: string }> = []
        let itemUsdValue = Big(0)

        if (item.type === 'Claim' && item.amount && item.rewardToken) {
          const tokenAddress = item.rewardToken
          const token = getTokenByAddress(tokenAddress)
          const symbol = token?.symbol || ''
          const priceMap: Record<string, number> = {
            [RIF]: rifPrice,
            [RBTC]: rbtcPrice,
            [USDRIF]: usdrifPrice,
          }
          const price = priceMap[symbol] || 0

          if (!amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress] = { total: Big(0), price }
          }
          amountsByToken[tokenAddress].total = amountsByToken[tokenAddress].total.plus(item.amount)

          const formattedAmount = formatSymbol(BigInt(item.amount), symbol)
          itemAmounts.push({ address: tokenAddress, value: formattedAmount, symbol })

          const usdAmount = getFiatAmount(BigInt(item.amount), price)
          totalUsdValue = totalUsdValue.plus(usdAmount)
          itemUsdValue = itemUsdValue.plus(usdAmount)
        } else if (item.type === 'Back' && item.allocation) {
          const tokenAddress = tokenContracts.stRIF
          const symbol = TOKENS.strif.symbol
          if (!amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress] = { total: Big(0), price: rifPrice }
          }
          amountsByToken[tokenAddress].total = amountsByToken[tokenAddress].total.plus(item.allocation)

          const formattedAmount = formatSymbol(BigInt(item.allocation), symbol)
          itemAmounts.push({ address: tokenAddress, value: formattedAmount, symbol })

          const usdAmount = getFiatAmount(BigInt(item.allocation), rifPrice)
          totalUsdValue = totalUsdValue.plus(usdAmount)
          itemUsdValue = itemUsdValue.plus(usdAmount)
        }

        groupedDetails.push({
          id: item.id,
          builderAddress: item.builder,
          blockTimestamp: item.blockTimestamp,
          amounts: itemAmounts,
          usdValue: itemUsdValue.toFixed(2),
        })
      })

      // Convert aggregated amounts to formatted strings
      const amounts = Object.entries(amountsByToken).map(([address, { total, price }]) => {
        const token = getTokenByAddress(address)
        const symbol = token?.symbol || TOKENS.strif.symbol
        const formattedAmount = formatSymbol(BigInt(total.toFixed(0)), symbol)
        return { address, value: formattedAmount, price }
      })

      rows.push({
        id: `${blockHash}-grouped`,
        data: {
          cycle: {
            cycle: cycleNumber.toString(),
          },
          date: {
            timestamp: firstItem.blockTimestamp,
            formatted: dateRange,
          },
          from_to: {
            type: transactionType,
            isGrouped: true,
            groupedDetails,
          },
          type: {
            type: transactionType,
          },
          amount: {
            amounts: amounts.map(a => ({ address: a.address, value: a.value })),
            type: transactionType,
          },
          total_amount: {
            usd: totalUsdValue.toFixed(2),
          },
        },
      })
    }
  })

  return rows
}
