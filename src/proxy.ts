import { NextRequest, NextResponse } from 'next/server'

import { checkRateLimit } from '@/lib/rateLimit'

interface RouteRateLimitConfig {
  prefix: string
  limit: number
  windowMs: number
}

/**
 * The cycle routes read the same state-sync Postgres pool as the gauge routes. `/api/cycles` and
 * `/api/cycles/backers` are cached, but a cache miss on `/backers` walks the whole allocation
 * history, so one client must not be able to hammer them while the cache is cold. A tab asks for
 * them once a minute at most, so the gauges budget fits.
 */
const CYCLES_RATE_LIMIT: RouteRateLimitConfig = { prefix: 'cycles', limit: 120, windowMs: 60_000 }

/**
 * Paginated reads over state-sync Postgres (`/api/backers`, `/api/builders`, `/api/allocations/daily`,
 * `/api/metrics/abi/context`, …). None of them is cached and each runs a COUNT plus an OFFSET scan.
 * A tab polls a handful of them once a minute and the CSV export walks tx-history 1000 rows a page,
 * so the gauges budget leaves room for several users behind one NAT.
 */
const DB_READ_RATE_LIMIT: RouteRateLimitConfig = { prefix: 'db_read', limit: 120, windowMs: 60_000 }

const RATE_LIMIT_CONFIGS: Record<string, RouteRateLimitConfig> = {
  '/api/auth/challenge': { prefix: 'auth_challenge', limit: 5, windowMs: 60_000 },
  '/api/auth/login': { prefix: 'auth_login', limit: 5, windowMs: 60_000 },
  '/api/auth/logout': { prefix: 'auth_logout', limit: 20, windowMs: 60_000 },
  '/api/auth/verify': { prefix: 'auth_verify', limit: 20, windowMs: 60_000 },
  '/api/support/ticket': { prefix: 'support_ticket', limit: 5, windowMs: 600_000 },
  '/api/cycles': CYCLES_RATE_LIMIT,
  '/api/backers': DB_READ_RATE_LIMIT,
  '/api/builders': DB_READ_RATE_LIMIT,
  // An operational probe that fans out to Envio, the RPC and a Slack webhook on every call
  '/api/envio-sync-check': { prefix: 'envio_sync_check', limit: 6, windowMs: 60_000 },
}

/**
 * Routes matched by prefix, for dynamic segments such as `/api/gauges/[gauge]/…`.
 *
 * The gauge routes are public and read state-sync Postgres, whose pool is shared with every other
 * route. A tab polls them a few times a minute (`AVERAGE_BLOCKTIME`), so the limit leaves room for
 * several users behind one NAT while capping how fast a single client can drain the pool.
 */
const PREFIX_RATE_LIMIT_CONFIGS: { pathPrefix: string; config: RouteRateLimitConfig }[] = [
  { pathPrefix: '/api/gauges/', config: { prefix: 'gauges', limit: 120, windowMs: 60_000 } },
  { pathPrefix: '/api/cycles/', config: CYCLES_RATE_LIMIT },
  { pathPrefix: '/api/backers/', config: DB_READ_RATE_LIMIT },
  { pathPrefix: '/api/allocations/', config: DB_READ_RATE_LIMIT },
  { pathPrefix: '/api/metrics/', config: DB_READ_RATE_LIMIT },
]

function resolveRateLimitConfig(pathname: string): RouteRateLimitConfig | undefined {
  return (
    RATE_LIMIT_CONFIGS[pathname] ??
    PREFIX_RATE_LIMIT_CONFIGS.find(({ pathPrefix }) => pathname.startsWith(pathPrefix))?.config
  )
}

// next.config.mjs rewrites these to PostHog and Sentry, which would otherwise receive the browser's cookies.
const THIRD_PARTY_REWRITE_PATH = /^\/(ingest|monitoring)(\/|$)/

function withoutCookies(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers)
  headers.delete('cookie')
  return NextResponse.next({ request: { headers } })
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
// Hex groups, `::` compression and an optional embedded IPv4 tail; strict enough to reject junk.
const IPV6 = /^(?=.{2,45}$)[0-9a-f:]*:[0-9a-f:]*(\.\d{1,3}){0,3}$/i

const isIpAddress = (value: string) => IPV4.test(value) || IPV6.test(value)

/**
 * The address the last proxy saw the request come from.
 *
 * `X-Forwarded-For` is a chain the client can start: the ALB *appends* the peer address to
 * whatever the request already carried, so only the last entry is trustworthy. Taking the
 * first would let a client pick its own rate-limit bucket. Anything that is not an IP literal
 * is ignored rather than used as a key, so the limiter cannot be filled with arbitrary strings.
 *
 * Falls back to 127.0.0.1 when no proxy headers are present (local dev, tests).
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map(hop => hop.trim())
    .filter(isIpAddress)
  const lastHop = forwardedFor?.at(-1)
  if (lastHop) return lastHop

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp && isIpAddress(realIp)) return realIp

  return '127.0.0.1'
}

function buildContentSecurityPolicy(nonce: string): string {
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
  // React's development build needs eval for its debugging stacks.
  if (process.env.NODE_ENV === 'development') {
    scriptSrc.push("'unsafe-eval'")
  }

  return [
    `script-src ${scriptSrc.join(' ')}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

// Next.js reads the nonce from the request's Content-Security-Policy header and adds it to the scripts it renders.
function withContentSecurityPolicy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const policy = buildContentSecurityPolicy(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', policy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', policy)

  return response
}

export function proxy(request: NextRequest) {
  if (THIRD_PARTY_REWRITE_PATH.test(request.nextUrl.pathname)) {
    return withoutCookies(request)
  }

  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/api/')) {
    return withContentSecurityPolicy(request)
  }

  const config = resolveRateLimitConfig(pathname)

  if (!config) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const result = checkRateLimit(ip, config.prefix, {
    limit: config.limit,
    windowMs: config.windowMs,
  })

  if (!result.success) {
    const retryAfterSeconds = Math.ceil(result.resetMs / 1000)

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))

  return response
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/support/:path*',
    '/api/gauges/:path*',
    '/api/cycles',
    '/api/cycles/:path*',
    '/api/backers',
    '/api/backers/:path*',
    '/api/builders',
    '/api/allocations/:path*',
    '/api/metrics/:path*',
    '/api/envio-sync-check',
    '/ingest/:path*',
    '/monitoring',
    {
      source: '/((?!api/|_next/static|_next/image|ingest|monitoring|images/|fonts/|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
