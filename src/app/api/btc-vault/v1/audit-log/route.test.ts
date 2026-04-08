import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { GET } from './route'

describe('GET /api/btc-vault/v1/audit-log', () => {
  it('returns 200 with mock rows and pagination (defaults)', async () => {
    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: { id: string }[]
      pagination: { total: number; page: number; limit: number; totalPages: number }
    }
    expect(body.data).toHaveLength(10)
    expect(body.pagination.total).toBe(10)
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.limit).toBe(20)
    expect(body.pagination.totalPages).toBe(1)
    expect(res.headers.get('Cache-Control')).toContain('no-store')
  })

  it('respects limit and page for mock data', async () => {
    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log?limit=3&page=2')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: { id: string }[]; pagination: { total: number } }
    expect(body.data).toHaveLength(3)
    expect(body.data[0]?.id).toBe('4')
    expect(body.pagination.total).toBe(10)
  })

  it('returns 400 when limit is out of range', async () => {
    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log?limit=500')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})
