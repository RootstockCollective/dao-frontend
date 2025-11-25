import { TransactionHistoryItem } from '../../utils/types'
import { GroupedTransactionDetail, TransactionHistoryTable } from './TransactionHistoryTable.config'
import { FIRST_CYCLE_START_SECONDS } from '@/app/collective-rewards/constants/chartConstants'
import { Duration } from 'luxon'
import { GetPricesResult } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { TOKENS_BY_ADDRESS } from '@/lib/tokens'
import Big from 'big.js'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { Address, getAddress } from 'viem'
import { formatCurrency } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'

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
  getBuilderByAddress: (address: Address) => Builder | undefined,
): TransactionHistoryTable['Row'][] => {
  if (!data.length) return []

  // Group transactions by blockHash
  const groupedByTransactionHash = data.reduce<Record<string, TransactionHistoryItem[]>>((acc, item) => {
    if (!acc[item.transactionHash]) {
      acc[item.transactionHash] = []
    }
    acc[item.transactionHash].push(item)
    return acc
  }, {})

  const rows: TransactionHistoryTable['Row'][] = []

  Object.entries(groupedByTransactionHash).forEach(([blockHash, items]) => {
    if (items.length === 1) {
      // Single transaction - create normal row
      const item = items[0]
      const builderAddress = getAddress(item.builder)
      const builder = getBuilderByAddress(builderAddress)
      const cycleNumber = calculateCycleNumber(item.cycleStart, cycleDuration)
      const dateRange = formatDateRange(item.cycleStart, cycleDuration)
      const transactionType = item.type
      const amounts: { address: Address; value: string; symbol: string }[] = []
      let totalUsdValue = Big(0)
      if (transactionType === 'Claim' && item.amount && item.rewardToken) {
        const tokenAddress = getAddress(item.rewardToken)
        const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
        const price = prices[symbol]?.price ?? 0
        const itemAmount = BigInt(item.amount)
        amounts.push({ address: item.rewardToken, value: formatSymbol(itemAmount, symbol), symbol })
        totalUsdValue = getFiatAmount(itemAmount, price)
      } else if (transactionType === 'Back' && item.allocation) {
        const tokenAddress = getAddress(tokenContracts.stRIF)
        const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
        const price = prices[symbol]?.price ?? 0
        const itemAllocation = BigInt(item.allocation)
        amounts.push({ address: tokenContracts.stRIF, value: formatSymbol(itemAllocation, symbol), symbol })
        totalUsdValue = getFiatAmount(itemAllocation, price)
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
            builder,
            builderAddress,
            type: transactionType,
          },
          type: {
            type: transactionType,
            increased: item.increased,
          },
          amount: {
            amounts: amounts,
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
      const amountsByToken: Record<Address, { symbol: string; amount: bigint }> = {}

      let totalUsdValue = Big(0)
      let increased: boolean | undefined = undefined
      const groupedDetails: GroupedTransactionDetail[] = []

      items.forEach(item => {
        let amount: { address: Address; value: string; symbol: string } | undefined = undefined
        let usdValue = Big(0)
        const builderAddress = getAddress(item.builder)
        const builder = getBuilderByAddress(builderAddress)

        if (item.type === 'Claim' && item.amount && item.rewardToken) {
          const tokenAddress = getAddress(item.rewardToken)
          const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
          const price = prices[symbol]?.price ?? 0

          const itemAmount = BigInt(item.amount)

          const usdAmount = getFiatAmount(itemAmount, price)
          usdValue = usdValue.plus(usdAmount)
          totalUsdValue = totalUsdValue.plus(usdAmount)
          // if token is already there we need to sum it
          if (amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress].amount += itemAmount
          } else {
            amountsByToken[tokenAddress] = { symbol, amount: itemAmount }
          }
          amount = { address: tokenAddress, value: formatSymbol(itemAmount, symbol), symbol }
        } else if (item.type === 'Back' && item.allocation) {
          const tokenAddress = getAddress(tokenContracts.stRIF)
          const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
          const price = prices[symbol]?.price ?? 0
          const itemAllocation = BigInt(item.allocation)

          const usdAmount = getFiatAmount(itemAllocation, price)
          usdValue = usdValue.plus(usdAmount)
          // Adjust total USD value and token amount based on increase
          const allocationChange = item.increased ? itemAllocation : -itemAllocation
          totalUsdValue = item.increased ? totalUsdValue.plus(usdAmount) : totalUsdValue.minus(usdAmount)

          if (amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress].amount += allocationChange
          } else {
            amountsByToken[tokenAddress] = { symbol, amount: allocationChange }
          }
          const tokenAmount = amountsByToken[tokenAddress].amount
          increased = tokenAmount === 0n ? undefined : tokenAmount < 0n ? false : true
          amount = { address: tokenAddress, value: formatSymbol(itemAllocation, symbol), symbol }
        }

        groupedDetails.push({
          id: item.id,
          builder,
          builderAddress,
          blockTimestamp: item.blockTimestamp,
          amount: amount!,
          usdValue: formatCurrency(usdValue, { showCurrencyLabel: false, showCurrencySymbol: false }),
          increased: item.increased,
        })
      })

      const amounts = Object.entries(amountsByToken).map(([address, { symbol, amount }]) => {
        const unsignedAmount = amount < 0n ? -amount : amount
        return { address: address as Address, value: formatSymbol(unsignedAmount, symbol), symbol }
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
            increased,
          },
          amount: {
            amounts: amounts,
            type: transactionType,
            increased,
          },
          total_amount: {
            usd: formatCurrency(totalUsdValue.abs(), { showCurrencyLabel: false, showCurrencySymbol: false }),
          },
        },
      })
    }
  })

  return rows
}
