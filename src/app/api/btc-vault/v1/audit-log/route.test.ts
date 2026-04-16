import { NextRequest } from 'next/server'
import { zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuditLogEntry } from '@/app/fund-admin/sections/audit-log/types'

import { GET } from './route'

vi.mock('./action', () => ({
  fetchBtcVaultAuditLogPage: vi.fn(),
}))

import { fetchBtcVaultAuditLogPage } from './action'

const mockFetch = vi.mocked(fetchBtcVaultAuditLogPage)

const sampleEntry: AuditLogEntry = {
  id: '0xabcde-0',
  vault: zeroAddress,
  type: 'PAUSED_DEPOSITS',
  amountInWei: null,
  detail: null,
  isNative: null,
  role: 'ADMIN',
  actor: zeroAddress,
  from: null,
  destination: null,
  blockNumber: 1n,
  blockTimestamp: 1735689600n,
  transactionHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  logIndex: '0',
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
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }))
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
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 3 }))
  })

  it('returns 400 when limit is out of range', async () => {
    const req = new NextRequest('http://localhost/api/btc-vault/v1/audit-log?limit=500')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('reports selected sort direction with date sort field pagination metadata', async () => {
    mockFetch.mockResolvedValue({ data: [sampleEntry], total: 1 })

    const req = new NextRequest(
      'http://localhost/api/btc-vault/v1/audit-log?sort_field=date&sort_direction=asc',
    )
    const res = await GET(req)
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      pagination: { sort_field: string; sort_direction: 'asc' | 'desc' }
    }
    expect(body.pagination.sort_field).toBe('date')
    expect(body.pagination.sort_direction).toBe('asc')
  })

  it('parses and forwards type/role/show filters', async () => {
    mockFetch.mockResolvedValue({ data: [sampleEntry], total: 1 })

    const req = new NextRequest(
      'http://localhost/api/btc-vault/v1/audit-log?type=VAULT_DEPOSIT&type=NAV_UPDATED&role=MANAGER&show=reason&show=rbtc',
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ['VAULT_DEPOSIT', 'NAV_UPDATED'],
        role: ['MANAGER'],
        show: ['reason', 'rbtc'],
      }),
    )
  })
})
