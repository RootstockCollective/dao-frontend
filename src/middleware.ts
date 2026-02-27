import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

interface RouteRateLimitConfig {
  prefix: string
  limit: number
  windowMs: number
}

const RATE_LIMIT_CONFIGS: Record<string, RouteRateLimitConfig> = {
  '/api/auth/challenge': { prefix: 'auth_challenge', limit: 5, windowMs: 60_000 },
  '/api/auth/login': { prefix: 'auth_login', limit: 5, windowMs: 60_000 },
  '/api/auth/verify': { prefix: 'auth_verify', limit: 20, windowMs: 60_000 },
}

// Falls back to 127.0.0.1 when no proxy headers are present (local dev, tests).
// In production the reverse proxy always sets x-forwarded-for / x-real-ip.
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const config = RATE_LIMIT_CONFIGS[pathname]

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
  matcher: ['/api/auth/:path*'],
}
