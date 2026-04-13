import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { BlockTimeProvider, useBlockTime } from './BlockTimeContext'

vi.mock('./computeAverageBlockTime', () => ({
  computeAverageBlockTime: vi.fn().mockResolvedValue(29_000),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BlockTimeProvider>{children}</BlockTimeProvider>
      </QueryClientProvider>
    )
  }
}

describe('BlockTimeContext', () => {
  it('should provide fetched block time values', async () => {
    const { result } = renderHook(() => useBlockTime(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.averageBlockTimeMs).toBe(29_000)
    })

    expect(result.current.secondsPerBlock).toBe(29)
  })

  it('should throw when used outside BlockTimeProvider', () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    expect(() => {
      renderHook(() => useBlockTime(), { wrapper })
    }).toThrow('useBlockTime must be used within a BlockTimeProvider')
  })
})
