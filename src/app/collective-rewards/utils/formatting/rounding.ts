export type RoundingMode = 'floor' | 'ceil' | 'round'
export type RoundingOptions = {
  mode: RoundingMode
  decimalPlaces: number
}

type RoundingFunction = (value: string, toDecimals: number) => string
type RoundingModes = Record<RoundingOptions['mode'], RoundingFunction>

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

export const roundingModes: RoundingModes = { floor, ceil, round }
