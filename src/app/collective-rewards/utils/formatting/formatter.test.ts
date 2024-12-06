import { describe, it, expect, test } from 'vitest'
import { DEFAULT_NUMBER_FORMAT_OPTIONS, formatNumber, NumberFormatOptions } from './formatter'
import { RoundingMode } from './rounding'

describe('formatNumber', () => {
  it('should return a string', () => {
    expect(formatNumber(1n)).toBeTypeOf('string')
  })

  it('should contain "." for decimals > 0', () => {
    const wholePart = '1234567'
    const decimalPart = '111222333444555666'
    const value = `${wholePart}${decimalPart}`
    const output = formatNumber(value, {
      decimals: 1,
    })
    expect(output.includes('.')).toBeTruthy()
  })

  it('should contain no "." when options.decimals == 0', () => {
    const wholePart = '1234567'
    const decimalPart = '111222333444555666'
    const value = `${wholePart}${decimalPart}`
    const output = formatNumber(value, {
      decimals: 0,
    })
    expect(output.includes('.')).toBeFalsy()
  })

  it('should separate thousands with given separator', () => {
    const value = '1234567111222333444555666'
    const output = formatNumber(value, {
      thousandsSeparator: '∂',
      decimals: 12,
    })

    expect(output).to.eq('1∂234∂567∂111∂222.333∂444∂555∂666')
  })

  test.each(
    Array(19)
      .fill(0)
      .map((_, i) => i),
  )('should have number of decimals as defined in options', expectedDecimals => {
    const value = '1234567111222333444555666'
    const output = formatNumber(value, {
      decimals: expectedDecimals,
    })

    const [_, actualDecimalPart] = output.split('.')

    expect(actualDecimalPart?.length ?? 0, `when options.decimals == ${expectedDecimals}`).to.eq(
      expectedDecimals,
    )
  })

  const roundingModes: RoundingMode[] = ['ceil', 'floor', 'round']
  test.each(
    Array(19 * roundingModes.length)
      .fill(0)
      .map((_, i) => [i % 19, roundingModes[i % roundingModes.length]]),
  )(
    'should contain number of decimals according to the decimalPlaces rounding options',
    (decimalPlaces, mode) => {
      const wholePart = '1234567'
      const decimalPart = '000111222333444555'
      const value = `${wholePart}${decimalPart}`
      const expectedNumberOfDecimals = decimalPlaces
      const output = formatNumber(value, {
        round: {
          decimalPlaces,
          mode,
        },
      })
      const [_, actualDecimalPart] = output.split('.')

      const actualNumberOfDecimals = actualDecimalPart?.length ?? 0

      expect(
        actualNumberOfDecimals,
        `when decimalPlaces == ${decimalPlaces} and rounding mode == ${mode}`,
      ).to.eq(expectedNumberOfDecimals)
    },
  )

  it('should carryover correctly when ceiled', () => {
    const wholePart = '1234567'
    const decimalPart = '999999999999999999'
    const value = `${wholePart}${decimalPart}`
    const output = formatNumber(value, {
      round: {
        decimalPlaces: 0,
        mode: 'ceil',
      },
    })

    expect(output).to.eq('1234568')
  })

  it('should not throw error when value is undefined', () => {
    expect(() => formatNumber(undefined as unknown as string)).to.not.throw()
  })

  it('should return 0 when value is undefined', () => {
    expect(formatNumber(undefined as unknown as string)).to.eq('0')
  })

  it('should return value without decimal point if result is integer', () => {
    const value = '1'.padEnd(19, '9')

    expect(
      formatNumber(value, {
        decimals: 18,
        round: {
          decimalPlaces: 0,
          mode: 'round',
        },
      }),
    ).to.eq('2')
  })

  it('should use default options when none are provided', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value)
    const outputWDefautls = formatNumber(value, DEFAULT_NUMBER_FORMAT_OPTIONS)
    expect(output).to.eq(outputWDefautls)
  })

  it('should handle mismatched options gracefully', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, {
      decimals: 10,
      round: {
        decimalPlaces: 5,
        mode: 'floor',
      },
    })
    expect(output).to.eq('123456789')
  })

  it('should format numbers correctly when decimals is zero', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, {
      decimals: 0,
      round: {
        decimalPlaces: 0,
        mode: 'round',
      },
    })
    expect(output.includes('.')).to.be.false
    expect(output).to.eq('1234567890000000000')
  })

  it('should format very small numbers correctly', () => {
    const value = '1'
    const output = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 18,
        mode: 'floor',
      },
    })
    expect(output).to.eq('0.000000000000000001')
  })

  it('should throw an error for unknown rounding mode', () => {
    const value = '1234567890000000000'
    expect(() =>
      formatNumber(value, {
        round: {
          mode: 'unknown' as RoundingMode,
          decimalPlaces: 1,
        },
      }),
    ).to.throw()
  })

  it('should not round the least significant digit unnecessarily', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 10,
        mode: 'ceil',
      },
    })
    expect(output.endsWith('0')).to.be.false
  })

  it('should allow iterative processing of the output', () => {
    const value = '1234567890000000000'
    const firstOutput = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 8,
        mode: 'round',
      },
      thousandsSeparator: ',',
    })
    const secondOutput = formatNumber(firstOutput, {
      decimals: 18,
      round: {
        decimalPlaces: 5,
        mode: 'floor',
      },
    })
    expect(secondOutput).to.eq('1.23456')
  })

  it('should format negative numbers correctly', () => {
    const value = '-1234567890000000000'
    const output = formatNumber(value)
    expect(output).to.eq('-1.23456789')
  })

  it('should handle extremely large numbers', () => {
    const value = '1234567890123456789012345678901234567890'
    const output = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 18,
        mode: 'floor',
      },
    })
    expect(output).to.eq('1234567890123456789012.34567890123456789')
  })

  it('should format non-integer decimal values correctly', () => {
    const value = '1234567.890123456789'
    const output = formatNumber(value, {
      decimals: 9,
      round: {
        decimalPlaces: 9,
        mode: 'round',
      },
    })
    expect(output).to.eq('1234567.890123457')
  })

  it('should accept value as different data types', () => {
    const valueAsString = '1234567890000000000'
    const valueAsNumber = 1.23456789
    const valueAsBigInt = 1234567890000000000n

    expect(formatNumber(valueAsString)).to.eq('1.23456789')
    expect(formatNumber(valueAsNumber)).to.eq('1.23456789')
    expect(formatNumber(valueAsBigInt)).to.eq('1.23456789')
  })

  it('should handle rounding edge cases correctly', () => {
    const value = '999999999999999999'
    const output = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 0,
        mode: 'ceil',
      },
    })
    expect(output).to.eq('1')
  })

  it('should return "0" for improper inputs', () => {
    expect(formatNumber('abc')).to.eq('0')
    expect(formatNumber('')).to.eq('0')
    expect(formatNumber(null as unknown as string)).to.eq('0')
  })

  it('should handle undefined options parameter', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, undefined)
    expect(output).to.eq('1.23456789')
  })

  it('should use default decimals when decimals option is missing', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, {
      round: {
        decimalPlaces: 5,
        mode: 'round',
      },
    })
    expect(output).to.eq('1.23457')
  })

  it('should format numbers with unusual thousands separator', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, {
      thousandsSeparator: '***',
      decimals: 9,
    })
    expect(output).to.eq('1***234***567***890')
  })

  it('should format numbers with leading zeros correctly', () => {
    const value = '00001_234_567_890_000_000_000'
    const output = formatNumber(value, {
      decimals: 18,
    })
    expect(output).to.eq('1.23456789')
  })

  it('should format very large numbers correctly', () => {
    const value = '12345678901234567890123456789012345678901234567890'
    const output = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 2,
        mode: 'round',
      },
      thousandsSeparator: '_',
    })
    expect(output).to.eq('12_345_678_901_234_567_890_123_456_789_012.35')
  })

  it('should format very small numbers correctly', () => {
    const value = '123'
    const output = formatNumber(value, {
      decimals: 18,
      round: {
        decimalPlaces: 18,
        mode: 'floor',
      },
    })
    expect(output).to.eq('0.000000000000000123')
  })

  it('should format negative numbers with decimals', () => {
    const value = '-1234567890'
    const output = formatNumber(value, {
      decimals: 9,
    })
    expect(output).to.eq('-1.23456789')
  })

  it('should handle zero value correctly', () => {
    const value = '0'
    const output = formatNumber(value)
    expect(output).to.eq('0')
  })

  it('should format numbers without decimal part when decimalPlaces is zero', () => {
    const value = '1234567890000000000'
    const output = formatNumber(value, {
      decimals: 9,
      round: {
        decimalPlaces: 0,
        mode: 'floor',
      },
      thousandsSeparator: ',',
    })
    expect(output).to.eq('1,234,567,890')
  })
})
