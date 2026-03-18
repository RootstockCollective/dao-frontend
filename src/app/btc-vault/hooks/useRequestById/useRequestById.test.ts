import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRequestById } from './useRequestById'

const API_RESPONSE_ONE_ITEM = {
  data: [
    {
      id: '0xuser1-epoch-1',
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
  ],
  pagination: { page: 1, limit: 200, total: 1, totalPages: 1 },
}

const API_RESPONSE_EMPTY = {
  data: [],
  pagination: { page: 1, limit: 200, total: 0, totalPages: 0 },
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderHookWithClient(hook: () => ReturnType<typeof useRequestById>) {
  const queryClient = createTestQueryClient()
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return renderHook(hook, { wrapper: Wrapper })
}

describe('useRequestById', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = mockFetch
  })

  it('does not run query when id is undefined', async () => {
    renderHookWithClient(() => useRequestById(undefined, '0xuser'))
    await waitFor(() => {})
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not run query when address is undefined', async () => {
    renderHookWithClient(() => useRequestById('some-id', undefined))
    await waitFor(() => {})
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches history with address and limit=200, finds item by id, returns mapped VaultRequest', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE_ONE_ITEM),
    })

    const id = '0xuser1-epoch-1'
    const address = '0xuser1'
    const { result } = renderHookWithClient(() => useRequestById(id, address))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/btc-vault/v1/history?')
    expect(url).toContain('address=0xuser1')
    expect(url).toContain('page=1')
    expect(url).toContain('limit=200')
    expect(url).toContain('sort_field=timestamp')
    expect(url).toContain('sort_direction=desc')

    const data = result.current.data!
    expect(data).not.toBeNull()
    expect(data.id).toBe('0xuser1-epoch-1')
    expect(data.type).toBe('deposit')
    expect(data.amount).toBe(1000000000000000000n)
    expect(data.status).toBe('pending')
    expect(data.epochId).toBe('1')
    expect(data.batchRedeemId).toBeNull()
    expect(data.timestamps).toEqual({ created: 1700000000, updated: 1700000000 })
    expect(data.txHashes.submit).toBe('0x' + 'a'.repeat(64))
  })

  it('returns null when item is not found in history response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(API_RESPONSE_EMPTY),
    })

    const { result } = renderHookWithClient(() =>
      useRequestById('non-existent-id', '0xuser'),
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeNull()
  })
})
