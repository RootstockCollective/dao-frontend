import { routePatterns } from './constants'

/**
 * Parses the error object when attempting to connect to extract the error message.
 * @param error
 */
export function parseWalletConnectionError(error: unknown): string {
  let errorParsed: string

  if (error instanceof Error) {
    // If it's an Error object, access the message property directly
    errorParsed = error.message
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    // If it's an object with a message property (but not an Error instance)
    errorParsed = (error as { message: string }).message
  } else {
    // Fall back to string conversion for other cases
    errorParsed = String(error)
  }
  switch (true) {
    case errorParsed.includes('rejected the request'):
      return 'Request to connect wallet has been rejected.'
    case errorParsed.includes('already pending'):
      return 'You have a pending request. Please check your wallet.'
    case errorParsed.includes('Provider not found'):
      return 'Your browser does not have a compatible wallet installed.'
    default:
      return errorParsed
  }
}

/**
 * Function that finds the component that should be used in the Page that the user is currently in
 * @param pathname
 */
export function getLeftComponentForRoute(pathname: string) {
  const match = routePatterns.find(route => route.pattern.test(pathname))
  return match ? match.component : null
}
