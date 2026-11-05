import { isAllowedDomain } from './domain'

export class CrossOriginRequestError extends Error {
  constructor(detail: string) {
    super(`Cross-origin request rejected: ${detail}`)
    this.name = 'CrossOriginRequestError'
  }
}

const originHostname = (origin: string): string | null => {
  try {
    return new URL(origin).hostname
  } catch {
    return null
  }
}

/**
 * Rejects a state-changing request that a browser sent from another origin.
 *
 * @throws CrossOriginRequestError when the request came from a page this app does not serve
 */
export function assertSameOriginRequest(request: Request): void {
  const fetchSite = request.headers.get('sec-fetch-site')
  // `none` is a user-initiated navigation (address bar, bookmark); it cannot carry a forged body
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    throw new CrossOriginRequestError(`Sec-Fetch-Site is ${fetchSite}`)
  }

  const origin = request.headers.get('origin')
  // Header absent: not a browser request (see above). A browser's opaque origin arrives as the
  // string "null", which fails to parse below and is rejected.
  if (origin === null) return

  const hostname = originHostname(origin)
  if (!hostname || !isAllowedDomain(hostname)) {
    throw new CrossOriginRequestError(`Origin ${origin} is not a host this app serves`)
  }
}
