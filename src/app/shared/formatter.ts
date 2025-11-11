import Big from '@/lib/big'
import { USD, WeiPerEther } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { BigSource } from 'big.js'

export const formatMetrics = (amount: bigint, price: BigSource, symbol: string, currency: string = USD) => {
  const fiatAmount = getFiatAmount(amount, price)

  return {
    amount: `${formatSymbol(amount, symbol)}`,
    fiatAmount: formatCurrencyWithLabel(fiatAmount, { currency }),
  }
}

export const getFiatAmount = (amount: bigint | string, price: BigSource): Big => {
  const bigAmount = Big(amount.toString())
  return bigAmount.mul(price).div(WeiPerEther.toString())
}

type SymbolFormatOptions = {
  decimals: number
  displayDecimals: number
}

const strif = {
  decimals: 18,
  displayDecimals: 0,
}

const rif = {
  decimals: 18,
  displayDecimals: 0,
}

const rbtc = {
  decimals: 18,
  displayDecimals: 5,
}

const usdrif = {
  decimals: 18,
  displayDecimals: 0,
}

const symbols: { [key: string]: SymbolFormatOptions } = {
  rif,
  rbtc,
  strif,
  usdrif,
}

export const formatSymbol = (value: bigint | string, symbol: string) => {
  if (!value || value === '0') {
    return '0'
  }
  const { decimals, displayDecimals } = symbols[symbol.toLocaleLowerCase()] ?? {
    decimals: 18,
    displayDecimals: 2,
  }

  const amount = Big(value.toString()).div(Big(10).pow(decimals))
  const minimumAmount = Big(1).div(Big(10).pow(displayDecimals))

  if (amount.lte(0)) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
      roundingMode: 'floor',
    }).format(amount.toString() as never)
  }

  if (amount.lt(1) && displayDecimals === 0) {
    return '<1'
  }

  if (amount.lt(minimumAmount)) {
    return `<0${displayDecimals > 0 ? '.'.padEnd(displayDecimals, '0') + '1' : ''}`
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
    roundingMode: 'floor',
  }).format(amount.toString() as never)
}

/**
 * Formats APY values from the vault contract
 * @param apyValue - APY value where 1e9 = 100% (e.g., 5e7 = 5%, 1e8 = 10%)
 * @param displayDecimals - Number of decimal places to show (default: 2)
 * @returns Formatted percentage string
 */
export const formatApy = (apyValue: bigint | string, displayDecimals: number = 2): string => {
  if (!apyValue || apyValue === '0' || apyValue === 0n) {
    return '0.00'
  }

  // APY scale: 1e9 = 100%
  const percentage = Big(apyValue.toString()).div(Big(10).pow(7))

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
    roundingMode: 'floor',
  }).format(percentage.toString() as never)
}
