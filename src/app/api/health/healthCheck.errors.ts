export class WrongHealthCheckTypeError extends Error {
  name: string = 'WrongHealthCheckTypeError'
  constructor(type: string) {
    super(`Health check type "${type}" is not defined`)
  }
}

export class BlockNumberFetchError extends Error {
  name: string = 'BlockNumberFetchError'
  constructor() {
    super(`Failed to fetch block number`)
  }
}

export class UnexpectedBehaviourError extends Error {
  name: string = 'FalsyLastBlockNumberError'
  constructor(error?: Error) {
    super(`Unexpected behaviour occurred: ${error?.message}`, {
      cause: error?.cause,
    })
  }
}
