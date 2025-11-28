import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Address } from 'viem'
import { useSwapQuote, SwapQuoteResponse } from './useSwapQuote'
import { SWAP_TOKEN_ADDRESSES } from '@/lib/swap/constants'

// Mock fetch globally
global.fetch = vi.fn()

const mockedFetch = vi.mocked(fetch)

// Mock isAddress to allow queries to run in tests
vi.mock('viem', async importOriginal => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    isAddress: vi.fn(address => {
      // Return true for any non-empty string to allow tests to run
      // In real usage, this would validate Ethereum addresses
      return typeof address === 'string' && address.length > 0 && address !== 'invalid-address'
    }),
  }
})

// Create a test QueryClient with testing-friendly defaults
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Disable garbage collection for tests
      },
    },
  })

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = createTestQueryClient()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestQueryClientProvider'
  return Wrapper
}

// Reusable function to wrap renderHook with QueryClientProvider
const renderHookWithQueryClient = <P, R>(hook: (initialProps: P) => R) => {
  return renderHook(hook, {
    wrapper: createWrapper(),
  })
}

describe('useSwapQuote', () => {
  // Use addresses from constants (loaded from .env) or fallback test addresses
  const mockTokenIn = (SWAP_TOKEN_ADDRESSES.USDT0 || '0x1111111111111111111111111111111111111111') as Address
  const mockTokenOut = (SWAP_TOKEN_ADDRESSES.USDRIF ||
    '0x2222222222222222222222222222222222222222') as Address
  const mockAmount = '100'

  const mockQuoteResponse: SwapQuoteResponse = {
    quotes: [
      {
        provider: 'uniswap',
        amountOut: '95.5',
        amountOutRaw: '95500000000000000000',
        gasEstimate: '150000',
      },
    ],
  }

  // Helper function to render hook with default parameters
  const renderUseSwapQuote = (params?: Partial<Parameters<typeof useSwapQuote>[0]>) => {
    return renderHookWithQueryClient(() =>
      useSwapQuote({
        amount: mockAmount,
        tokenIn: mockTokenIn,
        tokenOut: mockTokenOut,
        ...params,
      }),
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers() // Ensure real timers are used by default
    mockedFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockQuoteResponse,
      } as Response),
    )
  })

  afterEach(() => {
    vi.useRealTimers() // Clean up any fake timers after each test
  })

  describe('successful queries', () => {
    it('should fetch quotes with all required parameters', async () => {
      const { result } = renderUseSwapQuote()

      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toEqual(mockQuoteResponse)
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/api/swap/quote?tokenIn=${mockTokenIn}&tokenOut=${mockTokenOut}&amount=${mockAmount}`,
        ),
      )
    })

    it.skipIf(!SWAP_TOKEN_ADDRESSES.USDT0 || !SWAP_TOKEN_ADDRESSES.USDRIF)(
      'should use default token addresses when not provided',
      async () => {
        const { result } = renderHookWithQueryClient(() =>
          useSwapQuote({
            amount: mockAmount,
          }),
        )

        await waitFor(() => expect(result.current.data).toBeDefined())
        // The hook uses SWAP_TOKEN_ADDRESSES as defaults (see useSwapQuote.ts line 48-49)
        expect(mockedFetch).toHaveBeenCalledWith(
          expect.stringContaining(
            `/api/swap/quote?tokenIn=${SWAP_TOKEN_ADDRESSES.USDT0}&tokenOut=${SWAP_TOKEN_ADDRESSES.USDRIF}&amount=${mockAmount}`,
          ),
        )
      },
    )

    it('should return quotes with correct structure', async () => {
      const { result } = renderUseSwapQuote()

      await waitFor(() => expect(result.current.data?.quotes).toBeDefined())
      const quotes = result.current.data?.quotes
      expect(quotes).toBeDefined()
      expect(Array.isArray(quotes)).toBe(true)
      expect(quotes![0]).toHaveProperty('provider')
      expect(quotes![0]).toHaveProperty('amountOut')
      expect(quotes![0]).toHaveProperty('amountOutRaw')
      expect(typeof quotes![0].provider).toBe('string')
      expect(typeof quotes![0].amountOut).toBe('string')
      expect(typeof quotes![0].amountOutRaw).toBe('string')
    })

    it('should handle quotes with optional fields', async () => {
      const responseWithOptionalFields: SwapQuoteResponse = {
        quotes: [
          {
            provider: 'uniswap',
            amountOut: '95.5',
            amountOutRaw: '95500000000000000000',
            priceImpact: '0.5',
            gasEstimate: '150000',
          },
        ],
      }

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithOptionalFields,
      } as Response)

      const { result } = renderUseSwapQuote()

      await waitFor(() => expect(result.current.data?.quotes[0].priceImpact).toBe('0.5'))
      expect(result.current.data?.quotes[0].gasEstimate).toBe('150000')
    })

    it('should handle quotes with errors', async () => {
      const responseWithError: SwapQuoteResponse = {
        quotes: [
          {
            provider: 'uniswap',
            amountOut: '0',
            amountOutRaw: '0',
            error: 'Pool does not exist',
          },
        ],
      }

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithError,
      } as Response)

      const { result } = renderUseSwapQuote()

      await waitFor(() => expect(result.current.data?.quotes[0].error).toBe('Pool does not exist'))
    })
  })

  describe('query key generation', () => {
    it('should generate unique query key for different parameters', async () => {
      const { result: result1 } = renderUseSwapQuote({ amount: '100' })

      await waitFor(() => expect(result1.current.data).toBeDefined())

      // Clear mocks to verify separate calls
      mockedFetch.mockClear()

      const { result: result2 } = renderUseSwapQuote({ amount: '200' })

      await waitFor(() => expect(result2.current.data).toBeDefined())

      // Verify that separate queries were made with different parameters
      expect(mockedFetch).toHaveBeenCalledTimes(1)
      expect(mockedFetch).toHaveBeenCalledWith(expect.stringContaining('amount=200'))
      // Query keys should be different (different amounts)
      expect(result1.current.dataUpdatedAt).not.toBe(result2.current.dataUpdatedAt)
    })

    it('should use same query key for same parameters', async () => {
      const params = {
        amount: mockAmount,
        tokenIn: mockTokenIn,
        tokenOut: mockTokenOut,
      }

      const { result: result1 } = renderHookWithQueryClient(() => useSwapQuote(params))
      await waitFor(() => expect(result1.current.data).toBeDefined())

      const { result: result2 } = renderHookWithQueryClient(() => useSwapQuote(params))
      await waitFor(() => expect(result2.current.data).toBeDefined())

      // Both should fetch the same data (separate QueryClient instances, so both fetch)
      expect(mockedFetch).toHaveBeenCalledTimes(2)
      // Verify both calls used the same parameters
      expect(mockedFetch).toHaveBeenNthCalledWith(1, expect.stringContaining(`amount=${mockAmount}`))
      expect(mockedFetch).toHaveBeenNthCalledWith(2, expect.stringContaining(`amount=${mockAmount}`))
    })
  })

  describe('error handling', () => {
    it('should handle HTTP errors', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid amount' }),
      } as unknown as Response)

      const { result } = renderUseSwapQuote()

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 5000 },
      )

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('Invalid amount')
    })

    it('should handle network errors', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderUseSwapQuote()

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 5000 },
      )

      expect(result.current.error?.message).toContain('Network error')
    })

    it('should handle invalid JSON response', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as unknown as Response)

      const { result } = renderUseSwapQuote()

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 5000 },
      )

      expect(result.current.error?.message).toContain('Failed to fetch swap quotes')
    })

    it('should handle 500 server errors', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response)

      const { result } = renderUseSwapQuote()

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 5000 },
      )

      expect(result.current.error?.message).toContain('Internal server error')
    })
  })

  describe('enabled state', () => {
    it('should not fetch when enabled is false', () => {
      renderUseSwapQuote({ enabled: false })

      expect(mockedFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when amount is empty', () => {
      renderUseSwapQuote({ amount: '' })

      expect(mockedFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when tokenIn is invalid address', () => {
      renderUseSwapQuote({ tokenIn: 'invalid-address' as Address })

      expect(mockedFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when tokenOut is invalid address', () => {
      renderUseSwapQuote({ tokenOut: 'invalid-address' as Address })

      expect(mockedFetch).not.toHaveBeenCalled()
    })

    it('should fetch when enabled is true and all conditions are met', async () => {
      const { result } = renderUseSwapQuote({ enabled: true })

      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(mockedFetch).toHaveBeenCalled()
    })
  })

  // Note: Query options (staleTime, refetchInterval) are configuration-based
  // and are better tested through integration tests. The actual behavior
  // (caching, refetching) is complex to test with fake timers and can be flaky.
  // The configuration is verified by the hook working correctly in other tests.

  describe('parameter validation', () => {
    it('should handle valid token addresses', async () => {
      const validAddress = '0x1234567890123456789012345678901234567890' as Address

      const { result } = renderUseSwapQuote({
        tokenIn: validAddress,
        tokenOut: validAddress,
      })

      await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 })
      expect(mockedFetch).toHaveBeenCalled()
    })

    it('should handle decimal amounts', async () => {
      const { result } = renderUseSwapQuote({ amount: '100.5' })

      await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 })
      expect(mockedFetch).toHaveBeenCalledWith(expect.stringContaining('amount=100.5'))
    })

    it('should handle very small amounts', async () => {
      const { result } = renderUseSwapQuote({ amount: '0.000001' })

      await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 })
      expect(mockedFetch).toHaveBeenCalled()
    })

    it('should handle large amounts', async () => {
      const { result } = renderUseSwapQuote({ amount: '1000000' })

      await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 })
      expect(mockedFetch).toHaveBeenCalled()
    })
  })

  describe('response types', () => {
    it('should return correct TypeScript types', async () => {
      const { result } = renderUseSwapQuote()

      await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 })

      // Type checking - these should compile without errors
      const data: SwapQuoteResponse | undefined = result.current.data
      const isLoading: boolean = result.current.isLoading
      const isError: boolean = result.current.isError
      const error: Error | null = result.current.error

      expect(typeof data).toBe('object')
      expect(typeof isLoading).toBe('boolean')
      expect(typeof isError).toBe('boolean')
      expect(error === null || error instanceof Error).toBe(true)
    })
  })
})
