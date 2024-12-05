import { formatUnits } from 'viem'

export type RoundingMode = 'floor' | 'ceil' | 'round'
type RoundingOptions = {
  mode: RoundingMode
  decimalPlaces: number
}
type NumberFormatOptions = {
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

type FormatNumber = (value: bigint | string | number, options?: Partial<NumberFormatOptions>) => string
const normaliseValue: FormatNumber = (value, options) => {
  const valueAsBigInt = BigInt(value)
  const { decimals } = options as NumberFormatOptions
  const { decimalPlaces, mode } = options?.round as RoundingOptions
  const inUnits = formatUnits(valueAsBigInt, decimals)

  if (decimals === decimalPlaces) {
    return inUnits
  }

  const fn = roundingModes[mode]

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

const floor = (value: string, toDecimals: number) => {
  const indexOfDecimalPoint = value.indexOf('.')

  return value.slice(0, indexOfDecimalPoint + 1 + toDecimals)
}

const ceil = (value: string, toDecimals: number) => {
  const [wholePart, decimalPart] = value.split('.')
  if (!decimalPart || decimalPart.length < toDecimals) {
    return value
  }

  const croppedDecimals = decimalPart.slice(0, toDecimals)
  const retainingPrefix = '10'
  const ceiledPrefixedDecimals = (BigInt(retainingPrefix + croppedDecimals) + 1n).toString()
  const [_, carryover, ...ceiledDecimals] = ceiledPrefixedDecimals

  return `${BigInt(wholePart) + BigInt(carryover)}${toDecimals ? '.' : ''}${ceiledDecimals.join('')}`
}

const findLeastSignificantDigit = (value: string) => {
  if (!value.includes('.')) {
    return value.slice(-1)
  }

  return value.trim().replace(/0+$/, '').replace(/\.$/, '').slice(-1)
}

const round = (value: string, toDecimals: number) => {
  const leastSignificantDigit = findLeastSignificantDigit(value)
  if (Number(leastSignificantDigit) >= 5) {
    return ceil(value, toDecimals)
  }

  return floor(value, toDecimals)
}

type RoundingFunction = (value: string, toDecimals: number) => string
type RoundingModes = Record<RoundingOptions['mode'], RoundingFunction>
export const roundingModes: RoundingModes = { floor, ceil, round }

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
