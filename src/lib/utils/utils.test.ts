import Big from '@/lib/big'
import {
  durationToLabel,
  formatAssetData,
  formatCurrency,
  formatNumberWithCommas,
  millify,
  splitWords,
} from '@/lib/utils'
import { Duration } from 'luxon'
import { describe, expect, it } from 'vitest'

describe('formatCurrency', () => {
  it('formatCurrency with USD', () => {
    expect(formatCurrency(123456.789)).toBe('$123,456.79')
    expect(formatCurrency(123456.789, { showCurrency: true })).toBe('$123,456.79 USD')
  })

  it('formatCurrency with EUR', () => {
    expect(formatCurrency(123456.789, { currency: 'EUR' })).toBe('€123,456.79')
  })

  it('formatCurrency with small value', () => {
    expect(formatCurrency(0.0001)).toBe('<$0.01')
    expect(formatCurrency(0.0001, { showCurrency: true })).toBe('<$0.01 USD')
  })

  it('formatCurrency with zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(0, { showCurrency: true })).toBe('$0.00 USD')
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

describe('millify', () => {
  it('formats millions', () => {
    expect(millify(936000000)).toBe('936M')
  })

  it('formats billions', () => {
    expect(millify(1372000000)).toBe('1.372B')
  })

  it('formats trillions', () => {
    expect(millify(9876543210000)).toBe('9.876T')
  })

  it('formats thousands with decimals', () => {
    expect(millify(1234)).toBe('1.234K')
    expect(millify(3107.55)).toBe('3.107K')
  })

  it('formats big integers larger than trillion', () => {
    expect(millify(9876543210000000n)).toBe('9,876.543T')
  })

  it('formats numbers less than thousand', () => {
    expect(millify(999)).toBe('999')
  })

  it('formats Big numbers', () => {
    expect(millify(new Big(1234567890))).toBe('1.234B')
  })

  it('formats string numbers', () => {
    expect(millify('1234567890')).toBe('1.234B')
  })

  it('formats very small numbers', () => {
    expect(millify(0.0001)).toBe('0.0001')
  })

  it('formats zero', () => {
    expect(millify(0)).toBe('0')
  })

  it('formats negative numbers', () => {
    expect(millify(-1234567890)).toBe('-1.234B')
  })

  it('throws error on invalid input', () => {
    expect(() => millify('invalid' as never)).toThrow()
    expect(() => millify(undefined as never)).toThrow()
    expect(() => millify(null as never)).toThrow()
  })

  it('formats exact thresholds correctly', () => {
    expect(millify(1000)).toBe('1K')
    expect(millify(1000000)).toBe('1M')
    expect(millify(1000000000)).toBe('1B')
    expect(millify(1000000000000)).toBe('1T')
  })

  it('handles large numbers with proper rounding', () => {
    expect(millify(1372500)).toBe('1.372M')
    expect(millify(1372499)).toBe('1.372M')
    expect(millify(1372510)).toBe('1.372M')
    expect(millify(1372000000)).toBe('1.372B')
  })
})

describe('splitWords', () => {
  it('splits camelCase words', () => {
    expect(splitWords('camelCase')).toBe('camel Case')
    expect(splitWords('thisIsCamelCase')).toBe('this Is Camel Case')
  })

  it('splits PascalCase words', () => {
    expect(splitWords('PascalCase')).toBe('Pascal Case')
    expect(splitWords('ThisIsPascalCase')).toBe('This Is Pascal Case')
  })

  it('handles acronyms correctly', () => {
    expect(splitWords('JSONParser')).toBe('JSON Parser')
    expect(splitWords('parseXMLDocument')).toBe('parse XML Document')
    expect(splitWords('ABCdef')).toBe('AB Cdef')
    expect(splitWords('OGFounders')).toBe('OG Founders')
    expect(splitWords('OGContributors')).toBe('OG Contributors')
    expect(splitWords('EarlyAdopters')).toBe('Early Adopters')
  })

  it('handles single word inputs', () => {
    expect(splitWords('hello')).toBe('hello')
    expect(splitWords('Hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(splitWords('')).toBe('')
    expect(splitWords(undefined)).toBe('')
  })
})

describe('durationToLabel', () => {
  it('formats duration to label', () => {
    expect(durationToLabel(Duration.fromObject({ days: 1, hours: 2, minutes: 30 }))).toBe('1d 2h 30m')
  })

  it('returns undefined for undefined duration', () => {
    expect(durationToLabel(undefined)).toBe(undefined)
  })
})

describe('formatAssetData', () => {
  it('formats RIF amounts correctly', () => {
    const result = formatAssetData('1234.56', '500.789', 'RIF')
    expect(result.amount).toBe('1,235')
    expect(result.fiatAmount).toBe('500.79 USD')
  })

  it('formats rBTC amounts correctly', () => {
    const result = formatAssetData('1.23456789', '5000.789', 'rBTC')
    expect(result.amount).toBe('1.23456789')
    expect(result.fiatAmount).toBe('5,000.79 USD')
  })

  it('handles undefined values', () => {
    const result = formatAssetData(undefined, undefined, 'RIF')
    expect(result.amount).toBe('0')
    expect(result.fiatAmount).toBeUndefined()
  })

  it('defaults to non-RIF formatting when no token symbol provided', () => {
    const result = formatAssetData('1.23456789', '100', '')
    expect(result.amount).toBe('1.23456789')
    expect(result.fiatAmount).toBe('100.00 USD')
  })
})
