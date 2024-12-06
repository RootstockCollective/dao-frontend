import { formatUnits } from 'viem'
import { roundingModes, RoundingOptions } from './rounding'

export type NumberFormatOptions = {
  decimals: number
  thousandsSeparator: string
  round: Partial<RoundingOptions>
  prefix?: string
  postfix?: string
}

export const DEFAULT_NUMBER_FORMAT_OPTIONS: NumberFormatOptions = {
  decimals: 18,
  round: {
    mode: 'round',
    decimalPlaces: 18,
  },
  thousandsSeparator: '',
}

type Numberish = bigint | string | number
type FormatNumber = (value: Numberish, options?: Partial<NumberFormatOptions>) => string

const clearFormatting = <T extends Numberish>(value: T, decimals: number): Numberish => {
  const valueStr = value.toString().trim()
  const isNegative = valueStr.startsWith('-')
  const numericPart = valueStr.replace(/[^0-9.]/g, '')
  const cleanishValue = isNegative ? `-${numericPart}` : numericPart

  const [wholePart, decimalPart] = cleanishValue.split('.')

  if (!decimalPart) {
    return cleanishValue
  }

  if (decimalPart.length < decimals) {
    const paddedDecimalPart = decimalPart.padEnd(decimals, '0')
    return `${isNegative ? '-' : ''}${wholePart}${paddedDecimalPart}`
  }
  const roundFn = roundingModes.round
  const rounded = roundFn(cleanishValue, decimals).slice(wholePart.length + 1)

  const paddedDecimalPart = rounded.padEnd(decimals, '0')
  return `${isNegative ? '-' : ''}${wholePart}${paddedDecimalPart}`
}

const normaliseValue: FormatNumber = (value, options) => {
  const { decimals } = options as NumberFormatOptions
  const { decimalPlaces, mode } = options?.round as RoundingOptions
  const valueAsBigInt = BigInt(clearFormatting(value, decimals))
  const inUnits = formatUnits(valueAsBigInt, decimals)

  if (decimals === decimalPlaces || !inUnits.includes('.')) {
    return inUnits
  }

  const fn = roundingModes[mode]

  if (!fn) {
    throw new Error(`Rounding mode ${mode} not found.`)
  }

  return fn(inUnits, decimalPlaces)
}

const applyAccessories: FormatNumber = (value, options) => {
  return `${options?.prefix ?? ''}${value}${options?.postfix ?? ''}`
}

export const formatNumber: FormatNumber = (value, options) => {
  if (!value) {
    return '0'
  }

  const mergedOptions: NumberFormatOptions = {
    ...DEFAULT_NUMBER_FORMAT_OPTIONS,
    ...(options ?? {}),
    round: {
      ...DEFAULT_NUMBER_FORMAT_OPTIONS.round,
      ...(options?.round ?? {}),
    },
  }
  const normalisedValue = normaliseValue(value, mergedOptions)

  const withSeparator = insertThousandsSeparator(mergedOptions, normalisedValue)

  return applyAccessories(withSeparator, options)
}

export const formatRIF: FormatNumber = (value, options) => {
  return formatNumber(value, {
    decimals: 18,
    round: {
      decimalPlaces: 0,
      mode: 'floor',
      ...options?.round,
    },
    thousandsSeparator: ',',
    ...options,
  })
}

export const formatRBTC: FormatNumber = (value, options) => {
  return formatNumber(value, {
    decimals: 18,
    round: {
      decimalPlaces: 5,
      mode: 'floor',
      ...options?.round,
    },
    thousandsSeparator: ',',
    ...options,
  })
}

type FormatCurrency = (
  value: string | number | bigint,
  symbol?: string,
  options?: Partial<NumberFormatOptions>,
) => string
export const formatCurrency: FormatCurrency = (value, symbol, options) => {
  const valueAsString = value.toString()
  if (symbol?.toLowerCase().endsWith('rif')) {
    // TODO: I'm not happy with such weak checks. It would be better to map tokens onto addresses in configuration and read the map
    return formatRIF(valueAsString, options)
  }
  if (symbol?.toLowerCase().endsWith('rbtc')) {
    return formatRBTC(valueAsString, options)
  }

  return formatNumber(valueAsString, {
    round: {
      decimalPlaces: 3,
      ...options?.round,
    },
    ...options,
  })
}
function insertThousandsSeparator(mergedOptions: NumberFormatOptions, normalisedValue: string) {
  const { thousandsSeparator } = mergedOptions
  const [wholePart, decimalPart] = normalisedValue.split('.')
  const wholePartWSeparator = wholePart
    .split('')
    .reduceRight((acc: string, digit: string, index: number, arr) => {
      const inveredIndex = Math.abs(index - wholePart.length) - 1

      return `${digit}${!inveredIndex || inveredIndex % 3 ? '' : thousandsSeparator}${acc}`
    }, '')

  const decimalPartWSeparator = decimalPart
    ? decimalPart
        .split('')
        .reduce(
          (acc: string, digit: string, index: number) =>
            `${acc}${!index || index % 3 ? '' : thousandsSeparator}${digit}`,
          '',
        )
    : ''

  return `${wholePartWSeparator}${decimalPartWSeparator ? '.' : ''}${decimalPartWSeparator}`
}
