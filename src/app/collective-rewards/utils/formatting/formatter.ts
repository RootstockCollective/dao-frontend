import { formatUnits } from 'viem'
import { roundingModes, RoundingOptions } from './rounding'

export type NumberFormatOptions = {
  decimals: number
  thousandsSeparator: string
  round: Partial<RoundingOptions>
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

const cleanFormatting = <T extends Numberish>(value: T, { decimals }: NumberFormatOptions): Numberish => {
  if (typeof value === 'bigint') {
    return value
  }

  const cleanishValue: string =
    typeof value === 'string' ? value.trim().replaceAll(/[^\d.]/g, '') : value.toString()
  const [wholePart, decimalPart] = cleanishValue.split('.')

  if (!decimalPart) {
    return cleanishValue
  }

  return `${wholePart}${decimalPart.padEnd(decimals, '0')}`
}

const normaliseValue: FormatNumber = (value, options) => {
  const valueAsBigInt = BigInt(cleanFormatting(value, options as NumberFormatOptions))
  const { decimals } = options as NumberFormatOptions
  const { decimalPlaces, mode } = options?.round as RoundingOptions
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

  const { thousandsSeparator } = mergedOptions
  const [wholePart, decimalPart] = normalisedValue.split('.')
  const wholePartWSeparator = wholePart
    .split('')
    .reduceRight(
      (acc: string, digit: string, index: number, arr) =>
        `${digit}${index === arr.length - 1 || index % 3 ? '' : thousandsSeparator}${acc}`,
      '',
    )

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
  options?: NumberFormatOptions,
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
