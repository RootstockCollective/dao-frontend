import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useActiveRequests } from './useActiveRequests'

const mockUseReadContracts = vi.fn()
const mockUsePricesContext = vi.fn()

vi.mock('wagmi', () => ({
  useReadContracts: (...args: unknown[]) => mockUseReadContracts(...args),
}))

vi.mock('@/shared/context/PricesContext', () => ({
  usePricesContext: () => mockUsePricesContext(),
}))

const ADDRESS = '0x1234567890123456789012345678901234567890'
const ONE_ETHER = 10n ** 18n

function phase1Result(deposit: readonly [bigint, bigint], redeem: readonly [bigint, bigint]) {
  return {
    data: [
      { status: 'success' as const, result: deposit },
      { status: 'success' as const, result: redeem },
    ],
    isLoading: false,
    error: null,
  }
}

function phase2Result(
  results: Array<{ status: 'success'; result: bigint } | { status: 'success'; result: readonly [bigint, bigint, bigint, bigint] }>,
) {
  return {
    data: results,
    isLoading: false,
    error: null,
  }
}

function snapshotResult(assetsAtClose: bigint, supplyAtClose: bigint) {
  return { status: 'success' as const, result: [0n, assetsAtClose, supplyAtClose, 0n] as const }
}

describe('useActiveRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePricesContext.mockReturnValue({ prices: { rBTC: { price: 23750 } } })
  })

  describe('when address is undefined', () => {
    it('returns data undefined', () => {
      mockUseReadContracts.mockReturnValue({ data: undefined, isLoading: false, error: null })

      const { result } = renderHook(() => useActiveRequests(undefined))

      expect(result.current.data).toBeUndefined()
    })
  })

  describe('when user has no active requests', () => {
    it('returns empty array when both deposit and redeem are zero', () => {
      mockUseReadContracts
        .mockReturnValueOnce(phase1Result([0n, 0n], [0n, 0n]))
        .mockReturnValueOnce({ data: [], isLoading: false, error: null })

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toEqual([])
    })
  })

  describe('deposit request', () => {
    it('returns one display with status pending when deposit is pending', () => {
      const epochId = 1n
      const assets = ONE_ETHER
      mockUseReadContracts
        .mockReturnValueOnce(phase1Result([epochId, assets], [0n, 0n]))
        .mockReturnValueOnce(
          phase2Result([
            { status: 'success', result: assets },
            { status: 'success', result: 0n },
            snapshotResult(100n * ONE_ETHER, 50n * ONE_ETHER),
          ]),
        )

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].type).toBe('deposit')
      expect(result.current.data?.[0].status).toBe('pending')
      expect(result.current.data?.[0].amountFormatted).toBe('1')
      expect(result.current.data?.[0].id).toBe('dep-1')
    })

    it('returns one display with status claimable and claimable info when deposit is claimable', () => {
      const epochId = 1n
      const assets = ONE_ETHER
      const assetsAtClose = 100n * ONE_ETHER
      const supplyAtClose = 50n * ONE_ETHER
      mockUseReadContracts
        .mockReturnValueOnce(phase1Result([epochId, assets], [0n, 0n]))
        .mockReturnValueOnce(
          phase2Result([
            { status: 'success', result: 0n },
            { status: 'success', result: assets },
            snapshotResult(assetsAtClose, supplyAtClose),
          ]),
        )

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].type).toBe('deposit')
      expect(result.current.data?.[0].status).toBe('claimable')
      expect(result.current.data?.[0].claimable).toBe(true)
      expect(result.current.data?.[0].lockedSharePriceFormatted).toContain('/share')
    })
  })

  describe('redeem request', () => {
    it('returns one display with status pending when redeem is pending', () => {
      const epochId = 2n
      const shares = 2n * ONE_ETHER
      mockUseReadContracts
        .mockReturnValueOnce(phase1Result([0n, 0n], [epochId, shares]))
        .mockReturnValueOnce(
          phase2Result([
            { status: 'success', result: shares },
            { status: 'success', result: 0n },
            snapshotResult(200n * ONE_ETHER, 100n * ONE_ETHER),
          ]),
        )

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].type).toBe('withdrawal')
      expect(result.current.data?.[0].status).toBe('pending')
      expect(result.current.data?.[0].amountFormatted).toBe('2')
      expect(result.current.data?.[0].id).toBe('red-2')
    })

    it('returns one display with status claimable when redeem is claimable', () => {
      const epochId = 2n
      const shares = 2n * ONE_ETHER
      mockUseReadContracts
        .mockReturnValueOnce(phase1Result([0n, 0n], [epochId, shares]))
        .mockReturnValueOnce(
          phase2Result([
            { status: 'success', result: 0n },
            { status: 'success', result: shares },
            snapshotResult(200n * ONE_ETHER, 100n * ONE_ETHER),
          ]),
        )

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].type).toBe('withdrawal')
      expect(result.current.data?.[0].status).toBe('claimable')
      expect(result.current.data?.[0].claimable).toBe(true)
    })
  })

  describe('when both deposit and redeem requests exist', () => {
    it('returns two displays in order deposit then redeem', () => {
      const depEpochId = 1n
      const redEpochId = 2n
      mockUseReadContracts
        .mockReturnValueOnce(phase1Result([depEpochId, ONE_ETHER], [redEpochId, 3n * ONE_ETHER]))
        .mockReturnValueOnce(
          phase2Result([
            { status: 'success', result: ONE_ETHER },
            { status: 'success', result: 0n },
            snapshotResult(100n * ONE_ETHER, 50n * ONE_ETHER),
            { status: 'success', result: 0n },
            { status: 'success', result: 3n * ONE_ETHER },
            snapshotResult(200n * ONE_ETHER, 100n * ONE_ETHER),
          ]),
        )

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data?.[0].type).toBe('deposit')
      expect(result.current.data?.[0].status).toBe('pending')
      expect(result.current.data?.[1].type).toBe('withdrawal')
      expect(result.current.data?.[1].status).toBe('claimable')
    })
  })

  describe('loading and error', () => {
    it('returns data undefined while Phase 1 is loading', () => {
      mockUseReadContracts.mockReturnValue({ data: undefined, isLoading: true, error: null })

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toBeUndefined()
    })

    it('returns data undefined when Phase 1 has error', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('RPC error'),
      })

      const { result } = renderHook(() => useActiveRequests(ADDRESS))

      expect(result.current.data).toBeUndefined()
    })
  })
})
