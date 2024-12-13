import { formatUnits, formatEther } from 'viem'

export const formatMetrics = (amount: bigint, price: number, symbol: string, currency: string) => {
  const fiatAmount = getFiatAmount(amount, price)

  return {
    amount: `${formatSymbol(amount, symbol)} ${symbol}`,
    fiatAmount: formatFiatAmount(fiatAmount, currency),
  }
}

export const formatFiatAmount = (amount: number, currency: string) =>
  `= ${currency} ${formatCurrency(amount, currency)}`

export const getFiatAmount = (amount: bigint, price: number) => {
  const amountInEther = Number(formatEther(amount))
  return amountInEther * price
}

export const formatCurrency = (value: number, currency = 'USD'): string => {
  if (value > 0 && value < 0.01) {
    return '<0.01'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
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
  const amount = Number(formatUnits(value, decimals))
  const minimumAmount = 1 / Math.pow(10, displayDecimals)

  if (amount <= 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
      roundingMode: 'floor',
    }).format(amount)
  }

  if (amount < 1 && displayDecimals === 0) {
    return '<1'
  }

  if (amount < minimumAmount) {
    return `<0${displayDecimals > 0 ? '.'.padEnd(displayDecimals, '0') + '1' : ''}`
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
    roundingMode: 'floor',
  }).format(amount)
}
