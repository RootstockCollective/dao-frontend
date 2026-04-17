import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { EpochSettledEventDto } from '@/app/api/btc-vault/v1/epoch-history/action'

import { useDepositHistory } from './useDepositHistory'

const MOCK_DTOS: EpochSettledEventDto[] = [
  {
    epochId: '3',
    reportedOffchainAssets: '500',
    assets: '3000',
    supply: '2800',
    closedAt: '1700000',
    apy: 0.12,
  },
  {
    epochId: '2',
    reportedOffchainAssets: '400',
    assets: '2000',
    supply: '1900',
    closedAt: '1600000',
    apy: 0.08,
  },
  {
    epochId: '1',
    reportedOffchainAssets: '300',
    assets: '1000',
    supply: '1000',
    closedAt: '1500000',
    apy: null,
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDepositHistory', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_DTOS),
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns paginated deposit window rows', async () => {
    const { result } = renderHook(() => useDepositHistory({ page: 1, limit: 10, sortDirection: 'desc' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const paginated = result.current.data!
    expect(paginated.data).toHaveLength(3)
    expect(paginated.total).toBe(3)
    expect(paginated.page).toBe(1)
    expect(paginated.totalPages).toBe(1)
  })

  it('returns rows in descending order by default', async () => {
    const { result } = renderHook(() => useDepositHistory({ page: 1, limit: 10, sortDirection: 'desc' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const epochIds = result.current.data!.data.map(r => r.epochId)
    expect(epochIds).toEqual(['3', '2', '1'])
  })

  it('handles API error gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    const { result } = renderHook(() => useDepositHistory({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
    expect(result.current.error!.message).toContain('500')
  })
})
