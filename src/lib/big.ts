import Big, { BigSource, RoundingMode } from 'big.js'

/**
 * Single source for all Big Number related logic
 * Feel free to add methods as needed, so that it can be re-used across the codebase.
 */
declare module 'big.js' {
  interface BigConstructor {
    max(...args: Big[]): Big
  }
  interface Big {
    ceil(): Big
    roundHalfUp(decimalPlaces?: number): Big
    floor(decimalPlaces?: number): Big
    /**
     * Returns a string representing the value in normal notation to a fixed number of decimal places,
     * without trailing zeros.
     * @param dp Decimal places (0 to 1e+6 inclusive)
     * @param rm Rounding mode (0 to 3)
     *            0 = Rounds towards zero (truncate)
     *            1 = Rounds towards nearest neighbor, ties toward zero
     *            2 = Rounds towards nearest neighbor, ties away from zero
     *            3 = Rounds away from zero
     * @returns String representation without trailing zeros
     * @throws If dp or rm is invalid
     */
    toFixedNoTrailing(
      dp?: number, // Must be integer between 0 and 1e6 inclusive
      rm?: 0 | 1 | 2 | 3, // Literal union type for rounding modes
    ): string
  }
}

Big.max = function (...args: Big[]) {
  let x = arguments[0]
  for (let i = 1; i < arguments.length; i++) {
    const y = arguments[i]
    if (x.lt(y)) x = y
  }
  return x
}

Big.prototype.ceil = function () {
  const intPart = this.round(0, Big.roundDown)
  return this.gt(intPart) ? intPart.plus(1) : intPart
}

Big.prototype.roundHalfUp = function (decimalPlaces?: number) {
  if (this.lt(0)) {
    // For negative numbers, use roundHalfUp and add 1
    return this.round(decimalPlaces, Big.roundHalfUp).plus(1)
  }
  // For positive numbers, roundHalfUp works as expected
  return this.round(decimalPlaces, Big.roundHalfUp)
}

Big.prototype.floor = function (decimalPlaces?: number) {
  if (this.lt(0)) {
    // For negative numbers, round down and subtract 1
    return this.round(decimalPlaces || 0, Big.roundDown).minus(1)
  }
  // For zero or positive numbers, round down works as expected
  return this.round(decimalPlaces || 0, Big.roundDown)
}

Big.prototype.toFixedNoTrailing = function (dp?: number, rm?: RoundingMode) {
  // Validate dp (decimal places)
  if (dp !== undefined) {
    if (dp !== ~~dp || dp < 0 || dp > 1e6) {
      throw new Error('Invalid dp argument for toFixedNoTrailing')
    }
  }

  // Validate rm (rounding mode)
  if (rm !== undefined) {
    if (rm !== ~~rm || rm < 0 || rm > 3) {
      throw new Error('Invalid rm argument for toFixedNoTrailing')
    }
  }

  // Get the regular toFixed result
  const fixed = this.toFixed(dp, rm)

  // If dp is undefined, return normal notation
  if (dp === undefined) {
    return fixed
  }

  // Split into integer and decimal parts
  const parts = fixed.split('.')

  // If there's no decimal part, return as is
  if (parts.length === 1) {
    return parts[0]
  }

  // Trim trailing zeros from decimal part
  const trimmedDecimal = parts[1].replace(/0+$/, '')

  // If decimal part becomes empty after trimming, return just the integer part
  if (trimmedDecimal === '') {
    return parts[0]
  }

  // Return the number with trimmed decimal part
  return `${parts[0]}.${trimmedDecimal}`
}

const round = (value: BigSource, decimalPlaces?: number, rm?: RoundingMode) =>
  new Big(value).round(decimalPlaces, rm).toString()

export { round }
export default Big
