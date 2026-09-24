import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchBlockscoutGetLogsPaginated } from './fetch-blockscout-get-logs-paginated'
import { getCoolingDownKeys, resetBlockscoutKeyPool } from './blockscout-key-pool'
import {
  configureBlockscoutThrottle,
  resetBlockscoutThrottle,
  throttledBlockscoutFetch,
} from './request-throttle'

vi.mock('@/lib/constants', () => ({ CHAIN_ID: '30' }))

const ADDRESS = '0xa7671bd525f529b60bf9f6c28fbe5d64f2cd0d73' as const
const TOPIC = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e' as const

const emptyPage = () =>
  new Response(JSON.stringify({ status: '0', message: 'No logs found', result: [] }), { status: 200 })

/** The key a request carried, from the `Authorization: Bearer` header the builders attach. */
const keyOf = (init?: RequestInit) =>
  new Headers(init?.headers).get('authorization')?.replace(/^Bearer /, '') ?? '(none)'

const keysUsed = () =>
  (global.fetch as ReturnType<typeof vi.fn>).mock.calls.map(([, init]) =>
    keyOf(init as RequestInit | undefined),
  )

const withKey = (key: string): RequestInit => ({ headers: { Authorization: `Bearer ${key}` } })
const RPC_URL = 'https://api.blockscout.com/v2/api?chain_id=30'

const fetchLogs = () => fetchBlockscoutGetLogsPaginated({ query: { address: ADDRESS, topic0: TOPIC } })

describe('API key rotation', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    resetBlockscoutKeyPool()
    resetBlockscoutThrottle()
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = 'https://rootstock.blockscout.test'
    global.fetch = vi.fn().mockImplementation(async () => emptyPage())
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = { ...originalEnv }
    resetBlockscoutKeyPool()
    resetBlockscoutThrottle()
  })

  it('spreads consecutive requests across the configured keys', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'key_a,key_b,key_c'

    await fetchLogs()
    await fetchLogs()
    await fetchLogs()
    await fetchLogs()

    expect(keysUsed()).toEqual(['key_a', 'key_b', 'key_c', 'key_a'])
  })

  it('leaves a single configured key behaving exactly as before', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'proapi_one'

    await fetchLogs()
    await fetchLogs()

    expect(keysUsed()).toEqual(['proapi_one', 'proapi_one'])
  })

  it('sends no key at all when the PRO API is unconfigured', async () => {
    delete process.env.BLOCKSCOUT_API_KEY

    await fetchLogs()

    expect(keysUsed()).toEqual(['(none)'])
    expect(new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).origin).toBe(
      'https://rootstock.blockscout.test',
    )
  })

  it('rotates keys page by page within a single paginated call', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'key_a,key_b,key_c'
    configureBlockscoutThrottle({ minIntervalMs: 0 })

    const page = (blockNumber: string, tx: string) =>
      new Response(
        JSON.stringify({
          status: '1',
          message: 'OK',
          result: [{ blockNumber, logIndex: '0x0', transactionHash: tx, topics: [], data: '0x' }],
        }),
        { status: 200 },
      )
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(page('0x10', '0x1'))
      .mockResolvedValueOnce(page('0x20', '0x2'))
      .mockResolvedValueOnce(emptyPage())

    await fetchLogs()

    // Building the request once outside the loop would pin every page to key_a.
    expect(keysUsed()).toEqual(['key_a', 'key_b', 'key_c'])
  })

  it('parks the limited key on the real paginated path, where headers arrive as a Headers instance', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'key_a,key_b'
    configureBlockscoutThrottle({ maxAttempts: 1, minIntervalMs: 0 })

    global.fetch = vi
      .fn()
      .mockImplementation(async (_url: string, init?: RequestInit) =>
        keyOf(init) === 'key_a' ? new Response('{}', { status: 429 }) : emptyPage(),
      )

    await expect(fetchLogs()).rejects.toThrow('HTTP 429')

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect((init as RequestInit).headers).toBeInstanceOf(Headers)
    expect(getCoolingDownKeys()).toEqual(['key_a'])
  })

  it('parks only the key that was rate-limited, leaving the others in rotation', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'key_a,key_b,key_c'
    configureBlockscoutThrottle({ maxAttempts: 1, minIntervalMs: 0 })

    global.fetch = vi
      .fn()
      .mockImplementation(async (_url: string, init?: RequestInit) =>
        keyOf(init) === 'key_b' ? new Response('{}', { status: 429 }) : emptyPage(),
      )

    // key_a succeeds, key_b is limited.
    await throttledBlockscoutFetch(RPC_URL, withKey('key_a'))
    await throttledBlockscoutFetch(RPC_URL, withKey('key_b'))

    // Only the offender steps aside — parking all of them would discard the headroom the extra
    // keys exist to provide.
    expect(getCoolingDownKeys()).toEqual(['key_b'])
  })

  it('backs every caller off instead when there is only one key to protect', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'only_key'
    configureBlockscoutThrottle({ maxAttempts: 1, minIntervalMs: 0 })

    global.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 429 }))

    await throttledBlockscoutFetch(RPC_URL, withKey('only_key'))

    // With nothing to rotate to, parking the key would just be downtime.
    expect(getCoolingDownKeys()).toEqual([])
  })
})
