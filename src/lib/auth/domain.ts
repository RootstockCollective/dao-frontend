/**
 * Trusted domain resolution for SIWE authentication.
 *
 * EIP-4361 requires the Relying Party to bind a sign-in message to its own
 * *expected* origin, and to check that binding when the signature is redeemed.
 * The `Host` header is supplied by the caller, so it cannot serve as that
 * expectation on its own.
 *
 * The expected domain therefore comes from server-side configuration only:
 * `SIWE_ALLOWED_DOMAINS` when set, otherwise the deployment apex below.
 */

import { isProduction } from './utils'

/** All deployed environments live under this apex domain (see README env table) */
const DEFAULT_ALLOWED_APEX = 'rootstockcollective.xyz'

/** Loopback hosts, accepted outside production so local development keeps working */
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1']

export interface TrustedHost {
  /** RFC 4501 dns authority for the SIWE `domain` field */
  domain: string
  /** Absolute origin for the SIWE `uri` field */
  origin: string
}

/**
 * Split a Host header value into hostname and port.
 * Handles bracketed IPv6 authorities such as `[::1]:3000`.
 * A non-numeric port yields an empty hostname so the caller rejects it.
 */
function splitHost(host: string): { hostname: string; port: string } {
  const value = host.trim().toLowerCase()

  let hostname: string
  let port: string

  if (value.startsWith('[')) {
    const end = value.indexOf(']')
    if (end === -1) {
      return { hostname: '', port: '' }
    }
    hostname = value.slice(1, end)
    port = value.slice(end + 1).replace(/^:/, '')
  } else {
    const parts = value.split(':')
    if (parts.length > 2) {
      return { hostname: '', port: '' }
    }
    hostname = parts[0]
    port = parts[1] ?? ''
  }

  if (port && !/^\d+$/.test(port)) {
    return { hostname: '', port: '' }
  }

  return { hostname, port }
}

/**
 * Domains configured for this deployment, if any.
 * When set, this list is the only source of truth — the defaults below do not apply.
 */
function configuredDomains(): string[] {
  return (process.env.SIWE_ALLOWED_DOMAINS ?? '')
    .split(',')
    .map(entry => splitHost(entry).hostname)
    .filter(Boolean)
}

/**
 * Whether a hostname is an origin this deployment actually serves.
 * @param hostname - Bare hostname, without port
 */
export function isAllowedDomain(hostname: string): boolean {
  if (!hostname) {
    return false
  }

  const configured = configuredDomains()
  if (configured.length > 0) {
    return configured.includes(hostname)
  }

  if (!isProduction && LOCAL_HOSTNAMES.includes(hostname)) {
    return true
  }

  return hostname === DEFAULT_ALLOWED_APEX || hostname.endsWith(`.${DEFAULT_ALLOWED_APEX}`)
}

/**
 * Validate a Host header and derive the SIWE `domain` and `uri` values from it.
 *
 * @param host - The Host header value from the incoming request
 * @throws If the host is not an origin this deployment serves
 */
export function assertTrustedHost(host: string): TrustedHost {
  const { hostname, port } = splitHost(host)

  if (!isAllowedDomain(hostname)) {
    throw new Error(`Untrusted domain: ${hostname || host}`)
  }

  const protocol = isProduction ? 'https' : 'http'
  const authority = port ? `${hostname}:${port}` : hostname

  return { domain: hostname, origin: `${protocol}://${authority}` }
}
