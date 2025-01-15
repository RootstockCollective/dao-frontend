import Big from 'big.js'

declare module 'big.js' {
  interface BigConstructor {
    max(...args: Big[]): Big
  }
  interface Big {
    ceil(): Big
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

export default Big
