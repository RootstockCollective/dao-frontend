import Big from '@/lib/big'
import { BigSource } from 'big.js'
import { formatCurrency } from '@/lib/utils/utils'
import { WeiPerEther } from '@/lib/constants'

export const formatMetrics = (amount: bigint, price: BigSource, symbol: string, currency: string) => {
  const fiatAmount = getFiatAmount(amount, price)

  return {
    amount: `${formatSymbol(amount, symbol)} ${symbol}`,
    fiatAmount: formatFiatAmount(fiatAmount, currency),
  }
}

export const formatFiatAmount = (amount: BigSource, currency: string) =>
  `= ${currency} ${formatCurrency(amount, currency)}`

export const getFiatAmount = (amount: bigint, price: BigSource): Big => {
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

const symbols: { [key: string]: SymbolFormatOptions } = {
  rif,
  rbtc,
  strif,
}

export const formatSymbol = (value: bigint, symbol: string) => {
  if (!value) {
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
