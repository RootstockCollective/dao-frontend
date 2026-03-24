import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRequestHistory } from './useRequestHistory'

const API_RESPONSE = {
  data: [
    {
      id: '0xuser1-1',
      user: '0xuser1',
      action: 'DEPOSIT_REQUEST',
      assets: '1000000000000000000',
      shares: '0',
      epochId: '1',
      timestamp: 1700000000,
      blockNumber: '123',
      transactionHash: '0x' + 'a'.repeat(64),
      displayStatus: 'pending',
    },
    {
      id: '0xuser2-2',
      user: '0xuser2',
      action: 'REDEEM_CLAIMED',
      assets: '0',
      shares: '2000000000000000000',
      epochId: '2',
      timestamp: 1700003600,
      blockNumber: '456',
      transactionHash: '0x' + 'b'.repeat(64),
      displayStatus: 'successful',
    },
  ],
  pagination: { page: 1, limit: 20, total: 42, totalPages: 3 },
}

const defaultParams = { page: 1, limit: 20, sortDirection: 'desc' as const }

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderHookWithClient(hook: () => ReturnType<typeof useRequestHistory>) {
  const queryClient = createTestQueryClient()
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return renderHook(hook, { wrapper: Wrapper })
}

describe('useRequestHistory', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = mockFetch
  })

  it('does not run query when address is undefined', async () => {
    renderHookWithClient(() =>
      useRequestHistory(undefined, defaultParams, undefined),
    )
    await waitFor(() => {})
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls fetch with correct URL (address, page, limit, sort_field, sort_direction) when address is defined', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE),
    })

    const address = '0xabc'
    const params = { page: 2, limit: 10, sortDirection: 'asc' as const }
    const { result } = renderHookWithClient(() =>
      useRequestHistory(address, params, undefined),
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/btc-vault/v1/history?')
    expect(url).toContain('address=0xabc')
    expect(url).toContain('page=2')
    expect(url).toContain('limit=10')
    expect(url).toContain('sort_field=timestamp')
    expect(url).toContain('sort_direction=asc')
  })

  it('includes type[] in URL when filters provide type or claimToken', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE),
    })

    const address = '0xuser'
    const filters = { type: ['deposit' as const] }
    const { result } = renderHookWithClient(() =>
      useRequestHistory(address, defaultParams, filters),
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('type=deposit_request')
    expect(url).toContain('type=deposit_claimed')
    expect(url).toContain('type=deposit_cancelled')
  })

  it('returns PaginatedHistoryDisplay from API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE),
    })

    const { result } = renderHookWithClient(() =>
      useRequestHistory('0xuser', defaultParams, undefined),
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const data = result.current.data!
    expect(data.rows).toHaveLength(2)
    expect(data.total).toBe(42)
    expect(data.page).toBe(1)
    expect(data.limit).toBe(20)
    expect(data.totalPages).toBe(3)
    expect(data.rows[0].displayStatus).toBe('pending')
    expect(data.rows[0].amountFormatted).toBe('1')
    expect(data.rows[0].claimTokenType).toBe('rbtc')
    expect(data.rows[1].displayStatus).toBe('successful')
    expect(data.rows[1].amountFormatted).toBe('2')
    expect(data.rows[1].claimTokenType).toBe('shares')
    expect(data.rawRowCountBeforeStatusFilter).toBeUndefined()
  })

  it('filters rows by displayStatusLabel when filters.status is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE),
    })

    const filters = { status: ['Withdrawn' as const] }
    const { result } = renderHookWithClient(() =>
      useRequestHistory('0xuser', defaultParams, filters),
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const data = result.current.data!
    expect(data.rows).toHaveLength(1)
    expect(data.rows[0].displayStatusLabel).toBe('Withdrawn')
    expect(data.rows[0].id).toBe('0xuser2-2')
    expect(data.total).toBe(42)
    expect(data.page).toBe(1)
    expect(data.rawRowCountBeforeStatusFilter).toBe(2)
  })

  it('uses sort_field=assets when params.sortField is amount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE),
    })

    const params = { ...defaultParams, sortField: 'amount' }
    const { result } = renderHookWithClient(() =>
      useRequestHistory('0xuser', params, undefined),
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('sort_field=assets')
  })
})
