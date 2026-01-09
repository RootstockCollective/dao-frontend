import { TransactionHistoryItem } from '../../utils/types'
import { GroupedTransactionDetail, TransactionHistoryTable } from './TransactionHistoryTable.config'
import { Duration } from 'luxon'
import { GetPricesResult } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { TOKENS_BY_ADDRESS } from '@/lib/tokens'
import Big from 'big.js'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { Address, getAddress } from 'viem'
import { formatCurrency } from '@/lib/utils'
import { Builder } from '@/app/collective-rewards/types'
import { calculateCycleNumber, formatDateRange } from '../../utils/utils'

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
    const groupedByBuilder = items.reduce<Record<string, TransactionHistoryItem[]>>((acc, item) => {
      const builderAddress = getAddress(item.builder)
      if (!acc[builderAddress]) {
        acc[builderAddress] = []
      }
      acc[builderAddress].push(item)
      return acc
    }, {})

    const builderAddresses = Object.keys(groupedByBuilder)

    if (builderAddresses.length === 1 && items.length === 1) {
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
            transactionHash: item.transactionHash,
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
            usd: formatCurrency(totalUsdValue, { showCurrencyLabel: false, showCurrencySymbol: false }),
          },
        },
      })
    } else if (builderAddresses.length === 1) {
      // Multiple transactions to same builder - create consolidated row (not expandable)
      const builderAddress = builderAddresses[0] as Address
      const builderItems = groupedByBuilder[builderAddress]
      const firstItem = builderItems[0]
      const builder = getBuilderByAddress(builderAddress)
      const cycleNumber = calculateCycleNumber(firstItem.cycleStart, cycleDuration)
      const dateRange = formatDateRange(firstItem.cycleStart, cycleDuration)
      const transactionType = firstItem.type

      const amountsByToken: Record<Address, { symbol: string; amount: bigint; price: number }> = {}
      let increased: boolean | undefined = undefined

      builderItems.forEach(item => {
        if (item.type === 'Claim' && item.amount && item.rewardToken) {
          const tokenAddress = getAddress(item.rewardToken)
          const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
          const price = prices[symbol]?.price ?? 0
          const itemAmount = BigInt(item.amount)

          if (amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress].amount += itemAmount
          } else {
            amountsByToken[tokenAddress] = { symbol, amount: itemAmount, price }
          }
        } else if (item.type === 'Back' && item.allocation) {
          const tokenAddress = getAddress(tokenContracts.stRIF)
          const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
          const price = prices[symbol]?.price ?? 0
          const itemAllocation = BigInt(item.allocation)

          const allocationChange = item.increased ? itemAllocation : -itemAllocation

          if (amountsByToken[tokenAddress]) {
            amountsByToken[tokenAddress].amount += allocationChange
          } else {
            amountsByToken[tokenAddress] = { symbol, amount: allocationChange, price }
          }

          const tokenAmount = amountsByToken[tokenAddress].amount
          increased = tokenAmount === 0n ? undefined : tokenAmount < 0n ? false : true
        }
      })

      const amounts: Array<{ address: Address; value: string; symbol: string }> = []
      const usdValues: string[] = []

      Object.entries(amountsByToken).forEach(([address, { symbol, amount, price }]) => {
        const unsignedAmount = amount < 0n ? -amount : amount
        amounts.push({ address: address as Address, value: formatSymbol(unsignedAmount, symbol), symbol })

        const usdAmount = getFiatAmount(unsignedAmount, price)
        usdValues.push(formatCurrency(usdAmount, { showCurrencyLabel: false, showCurrencySymbol: false }))
      })

      rows.push({
        id: `${blockHash}-${builderAddress}`,
        data: {
          cycle: {
            cycle: cycleNumber.toString(),
          },
          date: {
            timestamp: firstItem.blockTimestamp,
            formatted: dateRange,
            transactionHash: blockHash,
          },
          from_to: {
            builder,
            builderAddress,
            type: transactionType,
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
            usd: usdValues.length > 1 ? usdValues : usdValues[0],
          },
        },
      })
    } else {
      // Multiple transactions to different builders - create expandable grouped row
      const firstItem = items[0]
      const cycleNumber = calculateCycleNumber(firstItem.cycleStart, cycleDuration)
      const dateRange = formatDateRange(firstItem.cycleStart, cycleDuration)
      const transactionType = firstItem.type
      const amountsByToken: Record<Address, { symbol: string; amount: bigint }> = {}

      let totalUsdValue = Big(0)
      let increased: boolean | undefined = undefined
      const groupedDetails: GroupedTransactionDetail[] = []

      Object.entries(groupedByBuilder).forEach(([builderAddr, builderItems]) => {
        const builderAddress = builderAddr as Address
        const builder = getBuilderByAddress(builderAddress)

        const builderAmountsByToken: Record<Address, { symbol: string; amount: bigint; price: number }> = {}
        let builderIncreased: boolean | undefined = undefined

        builderItems.forEach(item => {
          if (item.type === 'Claim' && item.amount && item.rewardToken) {
            const tokenAddress = getAddress(item.rewardToken)
            const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
            const price = prices[symbol]?.price ?? 0
            const itemAmount = BigInt(item.amount)
            const usdAmount = getFiatAmount(itemAmount, price)

            totalUsdValue = totalUsdValue.plus(usdAmount)

            if (amountsByToken[tokenAddress]) {
              amountsByToken[tokenAddress].amount += itemAmount
            } else {
              amountsByToken[tokenAddress] = { symbol, amount: itemAmount }
            }

            if (builderAmountsByToken[tokenAddress]) {
              builderAmountsByToken[tokenAddress].amount += itemAmount
            } else {
              builderAmountsByToken[tokenAddress] = { symbol, amount: itemAmount, price }
            }
          } else if (item.type === 'Back' && item.allocation) {
            const tokenAddress = getAddress(tokenContracts.stRIF)
            const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
            const price = prices[symbol]?.price ?? 0
            const itemAllocation = BigInt(item.allocation)
            const usdAmount = getFiatAmount(itemAllocation, price)

            const allocationChange = item.increased ? itemAllocation : -itemAllocation
            totalUsdValue = item.increased ? totalUsdValue.plus(usdAmount) : totalUsdValue.minus(usdAmount)

            if (amountsByToken[tokenAddress]) {
              amountsByToken[tokenAddress].amount += allocationChange
            } else {
              amountsByToken[tokenAddress] = { symbol, amount: allocationChange }
            }

            if (builderAmountsByToken[tokenAddress]) {
              builderAmountsByToken[tokenAddress].amount += allocationChange
            } else {
              builderAmountsByToken[tokenAddress] = { symbol, amount: allocationChange, price }
            }

            const tokenAmount = amountsByToken[tokenAddress].amount
            increased = tokenAmount === 0n ? undefined : tokenAmount < 0n ? false : true

            const builderTokenAmount = builderAmountsByToken[tokenAddress].amount
            builderIncreased = builderTokenAmount === 0n ? undefined : builderTokenAmount < 0n ? false : true
          }
        })

        const builderAmounts: Array<{ address: Address; value: string; symbol: string }> = []
        const builderUsdValues: string[] = []

        Object.entries(builderAmountsByToken).forEach(([address, { symbol, amount, price }]) => {
          const unsignedAmount = amount < 0n ? -amount : amount
          builderAmounts.push({
            address: address as Address,
            value: formatSymbol(unsignedAmount, symbol),
            symbol,
          })

          const usdAmount = getFiatAmount(unsignedAmount, price)
          builderUsdValues.push(
            formatCurrency(usdAmount, {
              showCurrencyLabel: false,
              showCurrencySymbol: false,
            }),
          )
        })

        groupedDetails.push({
          id: `${blockHash}-${builderAddress}`,
          builder,
          builderAddress,
          blockTimestamp: builderItems[0].blockTimestamp,
          transactionHash: blockHash,
          amounts: builderAmounts,
          usdValue: builderUsdValues.length > 1 ? builderUsdValues : builderUsdValues[0],
          increased: builderIncreased,
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
            transactionHash: blockHash,
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
