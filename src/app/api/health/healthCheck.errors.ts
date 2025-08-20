export class WrongHealthCheckTypeError extends Error {
  constructor(type: string) {
    super(`Health check type "${type}" is not defined`)
    this.name = 'WrongHealthCheckTypeError'
  }
}

export class BlockNumberFetchError extends Error {
  constructor() {
    super(`Failed to fetch block number`)
    this.name = 'BlockNumberFetchError'
  }
}
