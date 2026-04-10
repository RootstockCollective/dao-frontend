import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('./action', () => ({
  fetchBtcVaultAuditLogPage: vi.fn(),
}))

import { fetchBtcVaultAuditLogPage } from './action'

const mockFetch = vi.mocked(fetchBtcVaultAuditLogPage)

const sampleEntry = {
  id: '0xabc-0',
  date: 'Jan 1, 2026',
  action: 'Paused deposits',
  detail: null,
  tokenAmount: null,
  isNative: null,
  amountWei: null,
  user: 'Admin' as const,
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('GET /api/btc-vault/v1/audit-log', () => {
  it('returns 200 with pagination shape (defaults)', async () => {
    mockFetch.mockResolvedValue({ data: [], total: 0 })

    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: { id: string }[]
      pagination: { total: number; page: number; limit: number; totalPages: number }
    }
    expect(body.data).toHaveLength(0)
    expect(body.pagination.total).toBe(0)
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.limit).toBe(20)
    expect(body.pagination.totalPages).toBe(1)
    expect(res.headers.get('Cache-Control')).toContain('no-store')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    )
  })

  it('passes limit and page to the action', async () => {
    mockFetch.mockResolvedValue({
      data: [sampleEntry, sampleEntry, sampleEntry],
      total: 10,
    })

    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log?limit=3&page=2')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: unknown[]; pagination: { total: number } }
    expect(body.data).toHaveLength(3)
    expect(body.pagination.total).toBe(10)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 3 }),
    )
  })

  it('returns 400 when limit is out of range', async () => {
    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log?limit=500')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })
})
