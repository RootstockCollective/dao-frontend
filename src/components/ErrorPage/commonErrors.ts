// To be extended when we need to identify errors triggered in our codebase
// Allow to show a specific error message and not a generic one

export class BaseError extends Error {
  public readonly isBaseError = true
  constructor(
    public readonly name: string,
    message: string,
  ) {
    super(message)
    this.name = name
  }
}

export const isBaseError = (error: any): boolean => {
  return error?.isBaseError === true
}

export const isUserRejectedTxError = (error: any): boolean => {
  return (
    (error && typeof error.message === 'string' && error.message.includes('User rejected the request')) ||
    (error && error?.cause?.code === 4001)
  )
}

export const commonErrors = {
  ProviderNotFoundError: 'Your browser does not have a wallet installed.',
}

export const checkForCommonErrors = (error: Error): string => {
  const errorStr = error.toString()

  // Remove the leading 'Error: ' and extract the error name
  const errorName = errorStr.replace(/^Error:\s*/, '').split(':')[0]

  if (errorName in commonErrors) {
    return commonErrors[errorName as keyof typeof commonErrors]
  }

  return errorStr
}
