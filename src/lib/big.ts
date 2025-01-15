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
    roundHalfEven(decimalPlaces?: number): Big
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

Big.prototype.roundHalfEven = function (decimalPlaces?: number) {
  return this.round(decimalPlaces, Big.roundHalfUp)
}

Big.prototype.floor = function (decimalPlaces?: number) {
  return this.round(decimalPlaces, Big.roundDown)
}

export default Big
