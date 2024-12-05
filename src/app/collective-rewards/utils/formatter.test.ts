import { describe, it, expect, test } from 'vitest'
import { formatNumber, RoundingMode } from './formatter'

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
    expect(output.indexOf('.') > 0).toBeTruthy()
  })

  it('should contain no "." when options.decimals == 0', () => {
    const wholePart = '1234567'
    const decimalPart = '111222333444555666'
    const value = `${wholePart}${decimalPart}`
    const output = formatNumber(value, {
      decimals: 0,
    })
    expect(output.indexOf('.') == -1).toBeTruthy()
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

  // TODO: test w/ less decimals
  // TODO: test defaults
  // TODO: test mismatched options
  // TODO: test disappearance of .
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
  // TODO: test w/o decimals
  // TODO: test w/ 0.000001
  // TODO: test w/ unknown rounding mode
  // TODO: test that the least significant digit is not rounded
  // TODO: test that iterative processing is possible
})
