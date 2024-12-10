import { describe, it, expect, test } from 'vitest'
import { formatMetrics } from './formatMetrics'
import { formatUnits, parseEther } from 'viem'

const formatFiatAmount = (amount: number, currency: string) => `= ${currency} ${amount}`

const formatAmount = (amount: number, symbol: string) => `${amount} ${symbol}`

describe('formatMetrics', () => {
  it('should return `fiatAmount` equals to 0 if `amount` is zero', () => {
    const result = formatMetrics(0, 10, 'RIF', 'USD')

    expect(result.fiatAmount).toBe(formatFiatAmount(0, 'USD'))
  })
  it('should return `fiatAmount` equals to 0 if `price` is zero', () => {
    const result = formatMetrics(10, 0, 'RIF', 'USD')

    expect(result.fiatAmount).toBe(formatFiatAmount(0, 'USD'))
  })
  it('should return `amount` equals to 0 if `amount` is zero ', () => {
    const result = formatMetrics(0, 10, 'RIF', 'USD')

    expect(result.amount).toBe(formatAmount(0, 'RIF'))
  })
  it('should accept value as different data types(amount)', () => {
    const valueAsNumber = 1.23456789
    const valueAsBigInt = 1234567890000000000n

    const resultBigInt = formatMetrics(valueAsBigInt, 10, 'RIF', 'USD')
    const resultNumber = formatMetrics(valueAsNumber, 10, 'RIF', 'USD')

    expect(resultBigInt.amount).toBe(formatAmount(1.23, 'RIF'))
    expect(resultBigInt.fiatAmount).toBe(formatFiatAmount(12.346, 'USD'))
    expect(resultNumber.amount).toBe(formatAmount(1.23, 'RIF'))
    expect(resultNumber.fiatAmount).toBe(formatFiatAmount(12.346, 'USD'))
  })
  it('should accept value as different data types(price)', () => {
    const resultBigInt = formatMetrics(1.23456789, 10n, 'RIF', 'USD')
    const resultNumber = formatMetrics(1.23456789, 10, 'RIF', 'USD')

    expect(resultBigInt.amount).toBe(formatAmount(1.23, 'RIF'))
    expect(resultBigInt.fiatAmount).toBe(formatFiatAmount(12.346, 'USD'))
    expect(resultNumber.amount).toBe(formatAmount(1.23, 'RIF'))
    expect(resultNumber.fiatAmount).toBe(formatFiatAmount(12.346, 'USD'))
  })
  it.only('should format RIF properly', () => {
    const result = formatMetrics(parseEther('10'), 10, 'RIF', 'USD')

    expect(result.amount).toBe(formatAmount(10, 'RIF'))
    expect(result.fiatAmount).toBe(formatFiatAmount(100, 'USD'))
  })
  it('should format RBTC properly', () => {})
  it('should apply format properly', () => {})
  it('should format currency properly', () => {})
})
