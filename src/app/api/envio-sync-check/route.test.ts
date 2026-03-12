import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

describe('GET /api/envio-sync-check', () => {
  const graphqlUrl = 'https://indexer.test.example/graphql'
  const rpcUrl = 'https://rpc.test.example'

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('ENVIO_GRAPHQL_URL', graphqlUrl)
    vi.stubEnv('ENVIO_SYNC_CHECK_RPC_URL', rpcUrl)
  })

  it('should return 401 when ENVIO_SYNC_CHECK_SECRET is set and request has no Bearer token', async () => {
    vi.stubEnv('ENVIO_SYNC_CHECK_SECRET', 'secret123')
    const req = new NextRequest('http://localhost/api/envio-sync-check')
    const res = await GET(req)
    vi.unstubAllEnvs()
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 401 when ENVIO_SYNC_CHECK_SECRET is set and token does not match', async () => {
    vi.stubEnv('ENVIO_SYNC_CHECK_SECRET', 'secret123')
    const req = new NextRequest('http://localhost/api/envio-sync-check', {
      headers: { Authorization: 'Bearer wrong' },
    })
    const res = await GET(req)
    vi.unstubAllEnvs()
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 503 when ENVIO_GRAPHQL_URL is not set', async () => {
    vi.stubEnv('ENVIO_GRAPHQL_URL', '')
    const req = new NextRequest('http://localhost/api/envio-sync-check')
    const res = await GET(req)
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('ENVIO_GRAPHQL_URL')
  })

  it('should return 503 when ENVIO_SYNC_CHECK_RPC_URL is not set', async () => {
    vi.stubEnv('ENVIO_SYNC_CHECK_RPC_URL', '')
    const req = new NextRequest('http://localhost/api/envio-sync-check')
    const res = await GET(req)
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('ENVIO_SYNC_CHECK_RPC_URL')
  })

  it('should return 200 with success, lastBlock, chainTip, lag when Envio and RPC respond', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: URL | RequestInfo) => {
      const u = typeof url === 'string' ? url : url instanceof Request ? url.url : (url as URL).href
      if (u === graphqlUrl) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: { SyncProgress: [{ lastBlock: '6000000' }] },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        )
      }
      if (u === rpcUrl) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x5B8D80' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        )
      }
      return Promise.reject(new Error(`Unexpected fetch: ${u}`))
    })
    const req = new NextRequest('http://localhost/api/envio-sync-check')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.lastBlock).toBe(6000000)
    expect(data.chainTip).toBe(6000000)
    expect(data.lag).toBe(0)
    expect(data.threshold).toBe(1000)
    expect(data.alerted).toBeUndefined()
  })

  it('should return 502 when Envio GraphQL fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: URL | RequestInfo) => {
      const u = typeof url === 'string' ? url : url instanceof Request ? url.url : (url as URL).href
      if (u === graphqlUrl) {
        return Promise.resolve(new Response('Server Error', { status: 500 }))
      }
      return Promise.reject(new Error(`Unexpected fetch: ${u}`))
    })
    const req = new NextRequest('http://localhost/api/envio-sync-check')
    const res = await GET(req)
    expect(res.status).toBe(502)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('last synced block')
  })

  it('should return 502 when RPC eth_blockNumber fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: URL | RequestInfo) => {
      const u = typeof url === 'string' ? url : url instanceof Request ? url.url : (url as URL).href
      if (u === graphqlUrl) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ data: { SyncProgress: [{ lastBlock: '6000000' }] } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        )
      }
      if (u === rpcUrl) {
        return Promise.resolve(new Response('RPC error', { status: 429 }))
      }
      return Promise.reject(new Error(`Unexpected fetch: ${u}`))
    })
    const req = new NextRequest('http://localhost/api/envio-sync-check')
    const res = await GET(req)
    expect(res.status).toBe(502)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('chain tip')
  })
})
