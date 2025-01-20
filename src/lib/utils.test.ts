import Big from '@/lib/big'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('formatCurrency', () => {
  it('formatCurrency with USD', () => {
    expect(formatCurrency(123456.789)).toBe('$123,456.79')
  })

  it('formatCurrency with EUR', () => {
    expect(formatCurrency(123456.789, 'EUR')).toBe('€123,456.79')
  })

  it('formatCurrency with small value', () => {
    expect(formatCurrency(0.0001)).toBe('<$0.01')
  })

  it('formatCurrency with zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formatCurrency with Big', () => {
    const b = new Big('5032485723458348569331745.33434346346912144534543')
    expect(isNaN(Number(b))).toBe(false)
    expect(formatCurrency(b)).toBe('$5,032,485,723,458,348,569,331,745.33')
  })

  it('formatCurrency with undefined', () => {
    expect(formatCurrency(undefined as never)).toBe('')
  })

  it('formatCurrency with NaN', () => {
    expect(formatCurrency(NaN as never)).toBe('')
  })

  it('formatCurrency with invalid Big', () => {
    expect(isNaN(Number('invalid' as never))).toBe(true)
    expect(formatCurrency('invalid' as never)).toBe('')
  })

  it('formatCurrency with Infinite', () => {
    expect(formatCurrency(Infinity)).toBe('')
  })

  it('formatCurrency with very small number', () => {
    expect(formatCurrency(1e-7)).toBe('<$0.01')
  })

  it('formatCurrency with mul between 2 Bigs', () => {
    expect(formatCurrency(new Big(0.1).mul(new Big(0.1)))).toBe('$0.01')
  })

  it('formatCurrency with Big 0', () => {
    expect(formatCurrency(new Big(0))).toBe('$0.00')
  })

  it('formatCurrency with bigint', () => {
    expect(formatCurrency(0n)).toBe('$0.00')
    expect(formatCurrency(1234567890123456789012345678901234567890n)).toBe(
      '$1,234,567,890,123,456,789,012,345,678,901,234,567,890.00',
    )
    expect(formatCurrency(-1234567890123456789012345678901234567890n)).toBe(
      '-$1,234,567,890,123,456,789,012,345,678,901,234,567,890.00',
    )
  })
})

describe('formatNumberWithCommas', () => {
  it('formatNumberWithCommas with number', () => {
    expect(formatNumberWithCommas(123456.789)).toBe('123,456.789')
  })
  it('formatNumberWithCommas with string', () => {
    expect(formatNumberWithCommas('123456.789')).toBe('123,456.789')
  })
  it('formatNumberWithCommas with Big', () => {
    expect(formatNumberWithCommas(new Big(123456.789))).toBe('123,456.789')
  })
  it('formatNumberWithCommas with undefined', () => {
    expect(formatNumberWithCommas(undefined as never)).toBe('')
  })
  it('formatNumberWithCommas with NaN', () => {
    expect(formatNumberWithCommas(NaN as never)).toBe('')
  })
  it('formatNumberWithCommas with invalid Big', () => {
    expect(isNaN(Number('invalid' as never))).toBe(true)
    expect(formatNumberWithCommas('invalid' as never)).toBe('')
  })
})
