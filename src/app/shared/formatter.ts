import { BigSource } from 'big.js'

import Big from '@/lib/big'
import { RBTC, RBTC_SYMBOLS, USD, WeiPerEther } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'

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

interface SymbolFormatOptions {
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
  displayDecimals: 2,
}

const usdt0 = {
  decimals: 6,
  displayDecimals: 2,
}
const symbols: { [key: string]: SymbolFormatOptions } = {
  rif,
  [RBTC.toLowerCase()]: rbtc, // Maps current env's RBTC symbol (rbtc or trbtc) to rbtc config
  strif,
  usdrif,
  usdt0,
}

export const getSymbolDecimals = (symbol: string): number => {
  return symbols[symbol.toLocaleLowerCase()]?.decimals ?? 18
}

export const formatSymbol = (value: bigint | string, symbol: string): string => {
  if (!value || value === '0') {
    return '0'
  }

  const amount = Big(value.toString())
  if (amount.lt(0)) {
    const positiveFormatted = formatSymbol(amount.abs().toFixed(), symbol)
    if (positiveFormatted.startsWith('<')) {
      return `>-${positiveFormatted.slice(1)}`
    }
    return `-${positiveFormatted}`
  }

  const symbolKey = symbol.toLocaleLowerCase()
  const { decimals, displayDecimals } = symbols[symbolKey] ?? {
    decimals: 18,
    displayDecimals: 2,
  }
  const isRbtc = RBTC_SYMBOLS.includes(symbolKey as (typeof RBTC_SYMBOLS)[number])
  const minimumFractionDigits = isRbtc ? 0 : displayDecimals

  const scaled = amount.div(Big(10).pow(decimals))
  const minimumAmount = Big(1).div(Big(10).pow(displayDecimals))

  if (scaled.lt(1) && displayDecimals === 0) {
    return '<1'
  }

  if (scaled.lt(minimumAmount)) {
    return `<0${displayDecimals > 0 ? '.'.padEnd(displayDecimals, '0') + '1' : ''}`
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: displayDecimals,
    roundingMode: 'floor',
  }).format(scaled.toString() as never)
}
