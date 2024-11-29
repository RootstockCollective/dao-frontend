import { describe, it, expect } from 'vitest'
import { formatMetrics, formatOnchainFraction } from './formatMetrics'

describe('formatOnchainFraction', () => {
  it('should format onchain fraction correctly with default decimals', () => {
    const amount = BigInt('1000000000000000000')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('1')
  })

  it('should format onchain fraction correctly with custom display decimals', () => {
    const amount = BigInt('1234567890000000000')
    const result = formatOnchainFraction(amount, 3)
    expect(result).toBe('1.234')
  })

  it('should round to the lower number', () => {
    const amount = BigInt('1237567890000000000')
    const result = formatOnchainFraction(amount, 2)
    expect(result).toBe('1.23')
  })

  it('should format onchain fraction correctly with custom decimals', () => {
    const amount = BigInt('123456789')
    const result = formatOnchainFraction(amount, 2, 9)
    expect(result).toBe('0.12')
  })

  it('should handle zero amount correctly', () => {
    const amount = BigInt('0')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('0')
  })

  it('should handle numbers without decimals', () => {
    const amount = BigInt('9000000000000000000')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('9')
  })

  it('should handle numbers without decimals and more than 1 character', () => {
    const amount = BigInt('90000000000000000000')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('90')
  })

  it('should handle numbers with decimals and 3 characters', () => {
    const amount = BigInt('900561000000000000000')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('900.56')
  })

  it('should handle numbers with decimals and 3 characters', () => {
    const amount = BigInt('9000127000000000000000')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('9000.12')
  })

  it('should handle very big numbers', () => {
    const amount = BigInt('987654321123456789012300000000000000')
    const result = formatOnchainFraction(amount)
    expect(result).toBe('987654321123456789.01')
  })
})
