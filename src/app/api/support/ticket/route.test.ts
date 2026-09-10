import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

const EXPLORER = 'https://explorer.testnet.rootstock.io'
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const WEBHOOK_URL = 'https://hooks.slack.com/services/T000/B000/xxx'

const ADDRESS = '0x1234567890abcdefABCDEF1234567890abcdef12'
const TX_HASH = `0x${'a'.repeat(64)}`

const validBody = (overrides: Record<string, unknown> = {}) => ({
  token: 'turnstile-token',
  topic: 'Staking',
  referenceType: 'Wallet address',
  reference: ADDRESS,
  description: 'My stake is not showing up in the dashboard.',
  ...overrides,
})

const createRequest = (body: unknown): NextRequest =>
  new NextRequest('http://localhost/api/support/ticket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

/** Imports the route fresh so module-level env reads (EXPLORER_URL) are re-evaluated. */
const importRoute = async () => (await import('./route')).POST

interface SlackPayload {
  text: string
  blocks: { type: string; fields?: { type: string; text: string }[] }[]
}

/** Reads the JSON body of the nth `fetch` call the route made. */
const fetchBody = <T>(mock: ReturnType<typeof vi.fn>, callIndex: number): T =>
  JSON.parse(mock.mock.calls[callIndex][1].body as string) as T

const slackFields = (payload: SlackPayload): string[] =>
  payload.blocks.flatMap(block => block.fields?.map(field => field.text) ?? [])

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
  vi.stubEnv('SLACK_SUPPORT_WEBHOOK_URL', WEBHOOK_URL)
  vi.stubEnv('NEXT_PUBLIC_EXPLORER', EXPLORER)

  fetchMock = vi.fn(async (url: string) => {
    if (url === SITEVERIFY_URL) {
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }
    return new Response('ok', { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('POST /api/support/ticket', () => {
  describe('reference validation', () => {
    it('accepts a well-formed address and returns a ticket ref', async () => {
      const POST = await importRoute()

      const response = await POST(createRequest(validBody()))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.ticket).toMatch(/^SUP-[0-9A-F]{8}$/)
    })

    it('accepts a well-formed tx hash', async () => {
      const POST = await importRoute()

      const response = await POST(
        createRequest(validBody({ referenceType: 'Transaction hash', reference: TX_HASH })),
      )

      expect(response.status).toBe(200)
    })

    it.each([
      ['a missing reference', { reference: undefined }],
      ['an empty reference', { reference: '' }],
      ['a malformed address', { reference: '0xnothex' }],
      ['a tx hash sent as an address', { reference: TX_HASH }],
      ['an address sent as a tx hash', { referenceType: 'Transaction hash', reference: ADDRESS }],
    ])('rejects %s with invalid_reference', async (_label, overrides) => {
      const POST = await importRoute()

      const response = await POST(createRequest(validBody(overrides)))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('invalid_reference')
    })

    it.each([
      ['a missing type', undefined],
      ['an unknown type', 'ENS name'],
      ['an empty type', ''],
    ])('rejects %s with invalid_reference_type', async (_label, referenceType) => {
      const POST = await importRoute()

      const response = await POST(createRequest(validBody({ referenceType })))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('invalid_reference_type')
    })

    it('reports the higher-priority field first when several are invalid', async () => {
      const POST = await importRoute()

      const response = await POST(createRequest(validBody({ topic: 'Nope', reference: 'bad' })))
      const data = await response.json()

      expect(data.error).toBe('invalid_topic')
    })

    it('never reaches Slack when the reference is invalid', async () => {
      const POST = await importRoute()

      await POST(createRequest(validBody({ reference: 'bad' })))

      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('Slack payload', () => {
    it('links the reference to the explorer under the selected type', async () => {
      const POST = await importRoute()

      await POST(createRequest(validBody({ referenceType: 'Transaction hash', reference: TX_HASH })))
      const payload = fetchBody<SlackPayload>(fetchMock, 1)

      expect(slackFields(payload)).toContain(`*Transaction hash:*\n<${EXPLORER}/tx/${TX_HASH}|${TX_HASH}>`)
    })

    it('uses the address path for the address type', async () => {
      const POST = await importRoute()

      await POST(createRequest(validBody()))
      const payload = fetchBody<SlackPayload>(fetchMock, 1)

      expect(slackFields(payload)).toContain(`*Wallet address:*\n<${EXPLORER}/address/${ADDRESS}|${ADDRESS}>`)
    })

    it('normalizes a trailing slash on the explorer URL', async () => {
      vi.stubEnv('NEXT_PUBLIC_EXPLORER', `${EXPLORER}//`)
      const POST = await importRoute()

      await POST(createRequest(validBody()))
      const payload = fetchBody<SlackPayload>(fetchMock, 1)

      expect(slackFields(payload).join('\n')).toContain(`<${EXPLORER}/address/${ADDRESS}|`)
    })

    it('falls back to the bare reference when no explorer is configured', async () => {
      vi.stubEnv('NEXT_PUBLIC_EXPLORER', '')
      const POST = await importRoute()

      await POST(createRequest(validBody()))
      const payload = fetchBody<SlackPayload>(fetchMock, 1)

      expect(slackFields(payload)).toContain(`*Wallet address:*\n${ADDRESS}`)
    })

    it('includes the reference in the notification fallback text', async () => {
      const POST = await importRoute()

      await POST(createRequest(validBody()))
      const payload = fetchBody<SlackPayload>(fetchMock, 1)

      expect(payload.text).toContain(`Wallet address: ${ADDRESS}`)
    })
  })

  describe('captcha and delivery', () => {
    it('does not post to Slack when Turnstile rejects the token', async () => {
      fetchMock.mockImplementation(
        async () => new Response(JSON.stringify({ success: false }), { status: 200 }),
      )
      const POST = await importRoute()

      const response = await POST(createRequest(validBody()))
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('captcha_failed')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('returns delivery_failed when the webhook responds non-2xx', async () => {
      fetchMock.mockImplementation(async (url: string) =>
        url === SITEVERIFY_URL
          ? new Response(JSON.stringify({ success: true }), { status: 200 })
          : new Response('no_service', { status: 404 }),
      )
      const POST = await importRoute()

      const response = await POST(createRequest(validBody()))
      const data = await response.json()

      expect(response.status).toBe(502)
      expect(data.error).toBe('delivery_failed')
    })
  })
})
