import { describe, it, expect, test } from 'vitest'
import { formatMetrics, formatCurrency, formatSymbol, getFiatAmount } from './formatter'
import { parseEther } from 'viem'

const formatFiatAmount = (amount: string, currency: string, currencySymbol = '') =>
  `= ${currency} ${currencySymbol}${amount}`

describe('formatter', () => {
  const oneEther = parseEther('1')
  const halfEther = parseEther('.5')
  const oneWei = 1n

  describe('formatMetrics', () => {
    let symbol = 'RIF'
    let currency = 'USD'
    let currencySymbol = '$'
    test.each([
      {
        amount: parseEther('1000000'),
        price: 10,
        symbol,
        currency,
        expected: {
          amount: `1,000,000 ${symbol}`,
          fiatAmount: formatFiatAmount('10,000,000.00', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('12345678901'),
        price: 10,
        symbol,
        currency,
        expected: {
          amount: `12,345,678,901 ${symbol}`,
          fiatAmount: formatFiatAmount('123,456,789,010.00', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('12345678901'),
        price: 0.1,
        symbol,
        currency,
        expected: {
          amount: `12,345,678,901 ${symbol}`,
          fiatAmount: formatFiatAmount('1,234,567,890.10', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('12345678901'),
        price: 0.01,
        symbol,
        currency,
        expected: {
          amount: `12,345,678,901 ${symbol}`,
          fiatAmount: formatFiatAmount('123,456,789.01', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('12345678901'),
        price: 0.49,
        symbol,
        currency,
        expected: {
          amount: `12,345,678,901 ${symbol}`,
          fiatAmount: formatFiatAmount('6,049,382,661.49', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('1000'),
        price: 10,
        symbol,
        currency,
        expected: {
          amount: `1,000 ${symbol}`,
          fiatAmount: formatFiatAmount('10,000.00', currency, currencySymbol),
        },
      },
      {
        amount: oneEther,
        price: 10,
        symbol,
        currency,
        expected: { amount: `1 ${symbol}`, fiatAmount: formatFiatAmount('10.00', currency, currencySymbol) },
      },
      {
        amount: halfEther,
        price: 10,
        symbol,
        currency,
        expected: { amount: `<1 ${symbol}`, fiatAmount: formatFiatAmount('5.00', currency, currencySymbol) },
      },
      {
        amount: oneWei,
        price: 10,
        symbol,
        currency,
        expected: { amount: `<1 ${symbol}`, fiatAmount: formatFiatAmount('<0.01', currency) },
      },
    ])(
      'formatMetrics($amount, $price, $symbol, $currency) -> $expected.amount, $expected.fiatAmount',
      ({ amount, price, symbol, currency, expected }) => {
        expect(formatMetrics(amount, price, symbol, currency)).toEqual(expected)
      },
    )

    symbol = 'RBTC'
    currency = 'USD'
    currencySymbol = '$'
    test.each([
      {
        amount: oneEther,
        price: 10,
        symbol,
        currency,
        expected: {
          amount: `1.00000 ${symbol}`,
          fiatAmount: formatFiatAmount('10.00', currency, currencySymbol),
        },
      },
      {
        amount: halfEther,
        price: 10,
        symbol,
        currency,
        expected: {
          amount: `0.50000 ${symbol}`,
          fiatAmount: formatFiatAmount('5.00', currency, currencySymbol),
        },
      },
      {
        amount: oneWei,
        price: 10,
        symbol,
        currency,
        expected: { amount: `<0.00001 ${symbol}`, fiatAmount: formatFiatAmount('<0.01', currency) },
      },
      {
        amount: oneEther,
        price: 100_000,
        symbol,
        currency,
        expected: {
          amount: `1.00000 ${symbol}`,
          fiatAmount: formatFiatAmount('100,000.00', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('100'),
        price: 100_000,
        symbol,
        currency,
        expected: {
          amount: `100.00000 ${symbol}`,
          fiatAmount: formatFiatAmount('10,000,000.00', currency, currencySymbol),
        },
      },
      {
        amount: parseEther('123456'),
        price: 100_000,
        symbol,
        currency,
        expected: {
          amount: `123,456.00000 ${symbol}`,
          fiatAmount: formatFiatAmount('12,345,600,000.00', currency, currencySymbol),
        },
      },
    ])(
      'formatMetrics($amount, $price, $symbol, $currency) -> $expected.amount, $expected.fiatAmount',
      ({ amount, price, symbol, currency, expected }) => {
        expect(formatMetrics(amount, price, symbol, currency)).toEqual(expected)
      },
    )

    symbol = 'RIF'
    currency = 'EUR'
    currencySymbol = '€'
    test.each([
      {
        amount: oneEther,
        price: 10,
        symbol,
        currency,
        expected: { amount: `1 ${symbol}`, fiatAmount: formatFiatAmount('10.00', currency, currencySymbol) },
      },
      {
        amount: halfEther,
        price: 10,
        symbol,
        currency,
        expected: { amount: `<1 ${symbol}`, fiatAmount: formatFiatAmount('5.00', currency, currencySymbol) },
      },
      {
        amount: oneWei,
        price: 10,
        symbol,
        currency,
        expected: { amount: `<1 ${symbol}`, fiatAmount: formatFiatAmount('<0.01', currency) },
      },
    ])(
      'formatMetrics($amount, $price, $symbol, $currency) -> $expected.amount, $expected.fiatAmount',
      ({ amount, price, symbol, currency, expected }) => {
        expect(formatMetrics(amount, price, symbol, currency)).toEqual(expected)
      },
    )
  })

  describe('getFiatAmount', () => {
    test.each([
      { amount: 0n, price: 0, expected: 0 },
      { amount: oneEther, price: 10, expected: 10 },
      { amount: halfEther, price: 10, expected: 5 },
      { amount: oneWei, price: 10, expected: 0.00000000000000001 },
    ])('getFiatAmount($amount, $price) -> $expected', ({ amount, price, expected }) => {
      expect(getFiatAmount(amount, price)).toBe(expected)
    })
  })
  describe('formatCurrency', () => {
    test.each([
      { value: 0, expected: '$0.00' },
      { currency: 'USD', value: 0, expected: '$0.00' },
      { currency: 'EUR', value: 0, expected: '€0.00' },
    ])('should format $currency properly with $value', ({ currency, value, expected }) => {
      expect(formatCurrency(value, currency)).toBe(expected)
    })

    test.each([
      { value: 5, expected: '$5.00' },
      { currency: 'USD', value: 5, expected: '$5.00' },
      { currency: 'EUR', value: 5, expected: '€5.00' },
    ])('should format $currency properly with $value', ({ currency, value, expected }) => {
      expect(formatCurrency(value, currency)).toBe(expected)
    })

    test.each([
      { value: 5.00001, expected: '$5.00' },
      { currency: 'USD', value: 5.00001, expected: '$5.00' },
      { currency: 'EUR', value: 5.00001, expected: '€5.00' },
    ])('should format $currency properly with $value', ({ currency, value, expected }) => {
      expect(formatCurrency(value, currency)).toBe(expected)
    })

    test.each([
      { value: 5.01, expected: '$5.01' },
      { currency: 'USD', value: 5.01, expected: '$5.01' },
      { currency: 'EUR', value: 5.01, expected: '€5.01' },
    ])('should format $currency properly with $value', ({ currency, value, expected }) => {
      expect(formatCurrency(value, currency)).toBe(expected)
    })

    test.each([
      { value: 0.001, expected: '<0.01' },
      { currency: 'USD', value: 0.001, expected: '<0.01' },
      { currency: 'EUR', value: 0.001, expected: '<0.01' },
    ])('should format $currency properly with $value', ({ currency, value, expected }) => {
      expect(formatCurrency(value, currency)).toBe(expected)
    })
  })
  describe('formatSymbol', () => {
    test.each([
      { symbol: 'Symbol', value: 0n, expected: '0' },
      { symbol: 'RIF', value: 0n, expected: '0' },
      { symbol: 'RIF', value: 1000000000000000n, expected: '<1' },
      { symbol: 'RBTC', value: 0n, expected: '0' },
      { symbol: 'RBTC', value: 1000000000000000n, expected: '0.00100' },
      { symbol: 'RBTC', value: 1000000000000n, expected: '<0.00001' },
      { symbol: 'stRIF', value: 0n, expected: '0' },
    ])('should format $symbol properly with $value', ({ symbol, value, expected }) => {
      expect(formatSymbol(value, symbol)).toBe(expected)
    })

    test.each([
      { symbol: 'Symbol', value: oneEther, expected: '1.00' },
      { symbol: 'RIF', value: oneEther, expected: '1' },
      { symbol: 'RBTC', value: oneEther, expected: '1.00000' },
      { symbol: 'stRIF', value: oneEther, expected: '1' },
    ])('should format $symbol properly with $value', ({ symbol, value, expected }) => {
      expect(formatSymbol(value, symbol)).toBe(expected)
    })

    test.each([
      { symbol: 'Symbol', value: halfEther, expected: '0.50' },
      { symbol: 'RIF', value: halfEther, expected: '<1' },
      { symbol: 'RBTC', value: halfEther, expected: '0.50000' },
      { symbol: 'stRIF', value: halfEther, expected: '<1' },
    ])('should format $symbol properly with $value', ({ symbol, value, expected }) => {
      expect(formatSymbol(value, symbol)).toBe(expected)
    })

    test.each([
      { symbol: 'Symbol', value: oneWei, expected: '<0.01' },
      { symbol: 'RIF', value: oneWei, expected: '<1' },
      { symbol: 'RBTC', value: oneWei, expected: '<0.00001' },
      { symbol: 'stRIF', value: oneWei, expected: '<1' },
    ])('should format $symbol properly with $value', ({ symbol, value, expected }) => {
      expect(formatSymbol(value, symbol)).toBe(expected)
    })
  })
})
