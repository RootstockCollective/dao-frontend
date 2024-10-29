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
