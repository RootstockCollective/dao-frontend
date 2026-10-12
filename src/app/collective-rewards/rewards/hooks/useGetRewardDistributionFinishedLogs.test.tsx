import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { mockFetchRewardDistributionFinished } = vi.hoisted(() => ({
  mockFetchRewardDistributionFinished: vi.fn(),
}))

vi.mock('@/app/collective-rewards/actions', () => ({
  fetchRewardDistributionFinished: mockFetchRewardDistributionFinished,
}))

import { useGetRewardDistributionFinishedLogs } from './useGetRewardDistributionFinishedLogs'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useGetRewardDistributionFinishedLogs', () => {
  afterEach(() => mockFetchRewardDistributionFinished.mockReset())

  it('reports loading until Blockscout answers, instead of an already-settled empty list', async () => {
    // Regression: `initialData: []` marked the query as succeeded before it ran, so the last-cycle
    // window read "no distribution this cycle" and the rewards rendered as a loaded zero.
    mockFetchRewardDistributionFinished.mockResolvedValue({ data: [] })

    const { result } = renderHook(() => useGetRewardDistributionFinishedLogs(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockFetchRewardDistributionFinished).toHaveBeenCalledTimes(1)
  })

  it('keeps a stable empty list while loading, so consumers memoising on it do not re-run', () => {
    mockFetchRewardDistributionFinished.mockReturnValue(new Promise(() => {}))

    const { result, rerender } = renderHook(() => useGetRewardDistributionFinishedLogs(), {
      wrapper: createWrapper(),
    })
    const first = result.current.data
    rerender()

    expect(result.current.data).toBe(first)
  })
})
