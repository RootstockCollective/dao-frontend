import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/logger'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const ROUTE = '/api/support/ticket'

const MAX_DESCRIPTION_LENGTH = 1000
const MIN_DESCRIPTION_LENGTH = 10
const MAX_EMAIL_LENGTH = 254

// Pragmatic email shape check (mirrors the client-side zod validation)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface SiteVerifyResponse {
  success: boolean
  'error-codes'?: string[]
}

interface TicketRequestBody {
  token?: unknown
  description?: unknown
  email?: unknown
}

/**
 * Escapes characters that Slack interprets in `mrkdwn` text so that
 * user-supplied content can't inject mentions (e.g. `<!channel>`, `<@U…>`)
 * or break the block layout. See https://api.slack.com/reference/surfaces/formatting#escaping
 */
const escapeSlack = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const buildSlackBlocks = (description: string, email: string | undefined, receivedAt: string) => [
  {
    type: 'header',
    text: { type: 'plain_text', text: 'New support ticket', emoji: false },
  },
  {
    type: 'section',
    fields: [
      { type: 'mrkdwn', text: `*From:*\n${email ? escapeSlack(email) : '_anonymous_'}` },
      { type: 'mrkdwn', text: `*Received:*\n${receivedAt}` },
    ],
  },
  { type: 'divider' },
  {
    type: 'section',
    text: { type: 'mrkdwn', text: `*Description:*\n${escapeSlack(description)}` },
  },
]

export async function POST(request: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const webhookUrl = process.env.SLACK_SUPPORT_WEBHOOK_URL

  if (!secret || !webhookUrl) {
    logger.error(
      { route: ROUTE, hasSecret: Boolean(secret), hasWebhook: Boolean(webhookUrl) },
      'Support endpoint is missing required env vars',
    )
    return NextResponse.json({ success: false, error: 'server_misconfigured' }, { status: 500 })
  }

  let body: TicketRequestBody
  try {
    body = (await request.json()) as TicketRequestBody
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_body' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const emailRaw = typeof body.email === 'string' ? body.email.trim() : ''
  const email = emailRaw.length > 0 ? emailRaw : undefined

  if (!token) {
    return NextResponse.json({ success: false, error: 'missing_token' }, { status: 400 })
  }
  if (description.length < MIN_DESCRIPTION_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json({ success: false, error: 'invalid_description' }, { status: 400 })
  }
  if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email))) {
    return NextResponse.json({ success: false, error: 'invalid_email' }, { status: 400 })
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
    const verification = (await cfResponse.json()) as SiteVerifyResponse

    if (!verification.success) {
      logger.warn({ route: ROUTE, errorCodes: verification['error-codes'] }, 'Turnstile verification failed')
      return NextResponse.json(
        { success: false, errorCodes: verification['error-codes'] ?? [] },
        { status: 403 },
      )
    }
  } catch (err) {
    logger.error({ err, route: ROUTE }, 'Error contacting Cloudflare siteverify')
    return NextResponse.json({ success: false, error: 'verification_failed' }, { status: 502 })
  }

  try {
    const slackResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `New support ticket from ${email ? escapeSlack(email) : 'anonymous'}`,
        blocks: buildSlackBlocks(description, email, new Date().toISOString()),
      }),
    })

    if (!slackResponse.ok) {
      const text = await slackResponse.text().catch(() => '')
      logger.error(
        { route: ROUTE, status: slackResponse.status, body: text.slice(0, 200) },
        'Slack webhook returned non-2xx',
      )
      return NextResponse.json({ success: false, error: 'delivery_failed' }, { status: 502 })
    }
  } catch (err) {
    logger.error({ err, route: ROUTE }, 'Error posting to Slack webhook')
    return NextResponse.json({ success: false, error: 'delivery_failed' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
