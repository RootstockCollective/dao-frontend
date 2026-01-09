import { Duration } from 'luxon'
import { FIRST_CYCLE_START_SECONDS } from '@/app/collective-rewards/constants/chartConstants'
import { TransactionHistoryItem } from './types'
import { GetPricesResult } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { TOKENS_BY_ADDRESS } from '@/lib/tokens'
import { getFiatAmount } from '@/app/shared/formatter'
import { Address, getAddress } from 'viem'
import Big, { BigSource } from 'big.js'

export const formatExpandedDate = (timestamp: string): string => {
  const date = new Date(Number(timestamp) * 1000)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  return date.toLocaleString('en-US', options)
}

/**
 * Calculate cycle number from cycle start timestamp
 */
export const calculateCycleNumber = (cycleStartTimestamp: string, cycleDuration: Duration): number => {
  const cycleStartSeconds = Number(cycleStartTimestamp)
  const cycleDurationSeconds = cycleDuration.as('seconds')
  return Math.floor((cycleStartSeconds - FIRST_CYCLE_START_SECONDS) / cycleDurationSeconds) + 1
}

/**
 * Format date range for cycle display (e.g., "Jan 1 - 15, 2024")
 */
export const formatDateRange = (cycleStart: string, cycleDuration: Duration): string => {
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
    if (startDay === endDay) {
      return `${startMonth} ${startDay}, ${startYear}`
    }
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`
  }

  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`
  }

  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
}

/**
 * Format date for CSV export (e.g., "Jan 1, 2024, 12:00 PM")
 */
export const formatDateForCsv = (timestamp: string): string => {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format symbol amount showing actual decimal values (for CSV export)
 * Unlike formatSymbol, this always shows the actual value, never "<1" or "<0.01"
 */
const formatSymbolForCsv = (value: bigint | string, symbol: string): string => {
  if (!value || value === '0') {
    return '0'
  }
  const { decimals, displayDecimals } = {
    rif: { decimals: 18, displayDecimals: 6 },
    rbtc: { decimals: 18, displayDecimals: 8 },
    strif: { decimals: 18, displayDecimals: 6 },
    usdrif: { decimals: 18, displayDecimals: 6 },
  }[symbol.toLocaleLowerCase()] ?? {
    decimals: 18,
    displayDecimals: 6,
  }

  const amount = Big(value.toString()).div(Big(10).pow(decimals))

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
    roundingMode: 'floor',
  }).format(amount.toString() as never)
}

/**
 * Format currency amount showing actual decimal values (for CSV export)
 * Unlike formatCurrency, this always shows the actual value, never "<$0.01"
 */
const formatCurrencyForCsv = (amount: BigSource): string => {
  if (isNaN(Number(amount))) {
    return '0.00'
  }

  let bigAmount: Big
  try {
    bigAmount = Big(amount.toString())
  } catch {
    return '0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8, // Show up to 8 decimals for very small values
  }).format(bigAmount.toString() as never)
}

/**
 * Process transaction item to extract amount, symbol, and USD value
 * Returns actual values (no "<1" or "<$0.01") suitable for CSV export
 */
export const processTransactionAmount = (
  item: TransactionHistoryItem,
  prices: GetPricesResult,
): {
  amount: string
  symbol: string
  usdValue: string
  tokenAddress?: Address
} => {
  if (item.type === 'Claim' && item.amount && item.rewardToken) {
    const tokenAddress = getAddress(item.rewardToken)
    const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
    const price = prices[symbol]?.price ?? 0
    const itemAmount = BigInt(item.amount)
    return {
      amount: formatSymbolForCsv(itemAmount, symbol),
      symbol,
      usdValue: formatCurrencyForCsv(getFiatAmount(itemAmount, price)),
      tokenAddress: item.rewardToken,
    }
  } else if (item.type === 'Back' && item.allocation) {
    const tokenAddress = getAddress(tokenContracts.stRIF)
    const symbol = TOKENS_BY_ADDRESS[tokenAddress]?.symbol || ''
    const price = prices[symbol]?.price ?? 0
    const itemAllocation = BigInt(item.allocation)
    return {
      amount: formatSymbolForCsv(itemAllocation, symbol),
      symbol,
      usdValue: formatCurrencyForCsv(getFiatAmount(itemAllocation, price)),
      tokenAddress: tokenContracts.stRIF,
    }
  }

  return {
    amount: '',
    symbol: '',
    usdValue: '0.00',
  }
}
