import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { type Address, getAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useGetGaugeNotifyRewardLogs } from './useGetNotifyRewardLogs'

const GAUGE = '0x1111111111111111111111111111111111111111' as Address
const RIF = '0xabcdef0123456789abcdef0123456789abcdef01' as Address
const RBTC = '0x2222222222222222222222222222222222222222' as Address

const dto = (rewardToken_: Address, timeStamp: number) => ({
  args: { rewardToken_, builderAmount_: '3', backersAmount_: '7' },
  timeStamp,
})

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useGetGaugeNotifyRewardLogs', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ [GAUGE]: [dto(RIF, 100), dto(RBTC, 150), dto(RIF, 300)] }),
      }),
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reports loading on the first render instead of an already-settled empty result', () => {
    // Regression: `initialData: []` marked the query as succeeded before it ran, so the last-cycle
    // card painted zero rewards rather than a loading state.
    const { result } = renderHook(() => useGetGaugeNotifyRewardLogs(GAUGE), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toEqual({})
  })

  it('waits while fromTimestamp is the 0 placeholder instead of fetching the whole history', () => {
    const { result } = renderHook(() => useGetGaugeNotifyRewardLogs(GAUGE, RIF, 0, 0), {
      wrapper: createWrapper(),
    })

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.data).toEqual({})
  })

  it('groups the events by checksummed reward token', async () => {
    const { result } = renderHook(() => useGetGaugeNotifyRewardLogs(GAUGE), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(Object.keys(result.current.data)).toEqual([getAddress(RIF), RBTC])
    expect(result.current.data[getAddress(RIF)]).toHaveLength(2)
  })

  it('applies the token and time window filters', async () => {
    const { result } = renderHook(() => useGetGaugeNotifyRewardLogs(GAUGE, RIF, 100, 200), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual({
      [getAddress(RIF)]: [
        { args: { rewardToken_: RIF, builderAmount_: 3n, backersAmount_: 7n }, timeStamp: 100 },
      ],
    })
  })
})
