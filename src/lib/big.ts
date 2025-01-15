import Big from 'big.js'
/*
Single source for all Big Number related logic

Feel free to add methods as needed, so that it can be re-used across the codebase.
 */

declare module 'big.js' {
  interface BigConstructor {
    max(...args: Big[]): Big
  }
  interface Big {
    ceil(): Big
    roundHalfUp(decimalPlaces?: number): Big
    floor(decimalPlaces?: number): Big
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

export default Big
