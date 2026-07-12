import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface SiteVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  action?: string
  cdata?: string
  hostname?: string
  challenge_ts?: string
}

export async function POST(request: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    logger.error({ route: '/api/support/verify-captcha' }, 'TURNSTILE_SECRET_KEY is not set')
    return NextResponse.json({ success: false, error: 'server_misconfigured' }, { status: 500 })
  }

  let token: unknown
  try {
    const body = (await request.json()) as { token?: unknown }
    token = body?.token
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_body' }, { status: 400 })
  }

  if (typeof token !== 'string' || token.length === 0) {
    return NextResponse.json({ success: false, error: 'missing_token' }, { status: 400 })
  }

  const remoteip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()

  try {
    const cfResponse = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
    })

    const data = (await cfResponse.json()) as SiteVerifyResponse

    if (!data.success) {
      logger.warn(
        { route: '/api/support/verify-captcha', errorCodes: data['error-codes'] },
        'Turnstile verification failed',
      )
      return NextResponse.json({ success: false, errorCodes: data['error-codes'] ?? [] }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error({ err, route: '/api/support/verify-captcha' }, 'Error contacting Cloudflare siteverify')
    return NextResponse.json({ success: false, error: 'verification_failed' }, { status: 502 })
  }
}
