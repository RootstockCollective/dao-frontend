import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger'
import { SUPPORT_TOPICS } from '@/shared/constants'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const ROUTE = '/api/support/ticket'

const MAX_DESCRIPTION_LENGTH = 1000
const MIN_DESCRIPTION_LENGTH = 10
const MAX_EMAIL_LENGTH = 254
// Legit payloads top out around ~3.5 KB (Turnstile token + capped fields).
// Rejecting anything larger before JSON.parse blocks DoS amplification with
// oversized bodies that would otherwise consume memory just to be discarded.
const MAX_BODY_BYTES = 8_192

interface SiteVerifyResponse {
  success: boolean
  'error-codes'?: string[]
}

// Validates and types the untrusted request body in one step. Empty/omitted
// email normalizes to `undefined`.
const ticketSchema = z.object({
  token: z.string().trim().min(1),
  topic: z.enum(SUPPORT_TOPICS),
  description: z.string().trim().min(MIN_DESCRIPTION_LENGTH).max(MAX_DESCRIPTION_LENGTH),
  email: z
    .union([z.literal(''), z.string().trim().email().max(MAX_EMAIL_LENGTH)])
    .optional()
    .transform(value => value || undefined),
})

type TicketData = z.infer<typeof ticketSchema>

// Maps the first failing field to the error code the client already understands.
const FIELD_ERROR_CODES: Record<keyof TicketData, string> = {
  token: 'missing_token',
  topic: 'invalid_topic',
  description: 'invalid_description',
  email: 'invalid_email',
}
const FIELD_PRIORITY: (keyof TicketData)[] = ['token', 'topic', 'description', 'email']

/**
 * Strips Unicode control characters a reader can't see but that change how
 * text is rendered — RTL overrides (U+202A–202E), directional isolates
 * (U+2066–2069), zero-width spaces/joiners (U+200B–200D), and BOM (U+FEFF).
 * These are used to disguise URLs (e.g. `evil.com/‮exe.doc`) or hide payloads
 * inside otherwise-innocent text.
 */
const stripInvisibleControls = (text: string): string =>
  text.replaceAll(/[\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g, '')

/**
 * Escapes characters that Slack interprets in `mrkdwn` text so that
 * user-supplied content can't inject mentions (e.g. `<!channel>`, `<@U…>`)
 * or break the block layout, and strips invisible control chars.
 * See https://api.slack.com/reference/surfaces/formatting#escaping
 */
const escapeSlackMrkdwn = (text: string): string =>
  stripInvisibleControls(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const generateTicketRef = (): string =>
  `SUP-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`

const buildSlackBlocks = (
  ticketRef: string,
  topic: string,
  description: string,
  email: string | undefined,
  receivedAt: string,
) => [
  {
    type: 'header',
    text: { type: 'plain_text', text: 'New support ticket', emoji: false },
  },
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: ':warning: Content submitted by an unverified user. Verify any link before clicking.',
      },
    ],
  },
  {
    type: 'section',
    fields: [
      { type: 'mrkdwn', text: `*Ticket:*\n${ticketRef}` },
      { type: 'mrkdwn', text: `*Topic:*\n${topic}` },
      { type: 'mrkdwn', text: `*From:*\n${email ? escapeSlackMrkdwn(email) : '_anonymous_'}` },
      { type: 'mrkdwn', text: `*Received:*\n${receivedAt}` },
    ],
  },
  { type: 'divider' },
  {
    type: 'section',
    text: { type: 'mrkdwn', text: '*Description:*' },
  },
  {
    type: 'section',
    // plain_text disables Slack's URL auto-linkification, so a phishing link
    // in the description is not clickable — the agent must copy it out.
    text: { type: 'plain_text', text: stripInvisibleControls(description), emoji: false },
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

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ success: false, error: 'body_too_large' }, { status: 413 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_body' }, { status: 400 })
  }

  const parsed = ticketSchema.safeParse(rawBody)
  if (!parsed.success) {
    const failedField = FIELD_PRIORITY.find(field =>
      parsed.error.issues.some(issue => issue.path[0] === field),
    )
    const error = failedField ? FIELD_ERROR_CODES[failedField] : 'invalid_body'
    return NextResponse.json({ success: false, error }, { status: 400 })
  }

  const { token, topic, description, email } = parsed.data

  try {
    // `remoteip` is intentionally omitted — the only header we could source it
    // from (`x-forwarded-for`) is attacker-controllable and would let a spoofed
    // value reach Cloudflare. siteverify accepts requests without it.
    const cfResponse = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const verification = (await cfResponse.json()) as SiteVerifyResponse

    if (!verification.success) {
      logger.warn({ route: ROUTE, errorCodes: verification['error-codes'] }, 'Turnstile verification failed')
      return NextResponse.json({ success: false, error: 'captcha_failed' }, { status: 403 })
    }
  } catch (err) {
    logger.error({ err, route: ROUTE }, 'Error contacting Cloudflare siteverify')
    return NextResponse.json({ success: false, error: 'verification_failed' }, { status: 502 })
  }

  const ticketRef = generateTicketRef()

  try {
    const slackResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `New support ticket ${ticketRef} (${topic}) from ${email ? escapeSlackMrkdwn(email) : 'anonymous'}`,
        blocks: buildSlackBlocks(ticketRef, topic, description, email, new Date().toISOString()),
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

  return NextResponse.json({ success: true, ticket: ticketRef })
}
