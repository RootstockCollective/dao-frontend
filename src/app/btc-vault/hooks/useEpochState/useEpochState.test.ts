/**
 * useEpochState tests verify status derivation from on-chain reads:
 * - open: closedAt === 0
 * - settling: closedAt > 0 and epochRedeemClaimable === false
 * - claimable: epochRedeemClaimable === true
 *
 * Wagmi useReadContract (currentEpoch, then optional prev epochSnapshot) and
 * useReadContracts (epochSnapshot, epochRedeemClaimable, openEpochPendingDepositAssets,
 * epochTotalRedeemShares) are mocked to force each path.
 */
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEpochState } from './useEpochState'

/** epochSnapshot returns [closedAt, assetsAtClose, supplyAtClose, syntheticAddedAssets] */
type EpochSnapshotTuple = readonly [bigint, bigint, bigint, bigint]

const mockUseReadContract = vi.fn()
const mockUseReadContracts = vi.fn()

vi.mock('wagmi', () => ({
  useReadContract: (opts: unknown) => mockUseReadContract(opts),
  useReadContracts: (opts: unknown) => mockUseReadContracts(opts),
}))

const refetchCurrent = vi.fn()
const refetchBatch = vi.fn()
const refetchPrev = vi.fn()

function makeBatchResult(
  closedAt: bigint,
  claimable: boolean,
  pendingAssets = 0n,
  totalRedeemShares = 0n,
  assetsAtClose = 10n ** 18n,
  supplyAtClose = 10n ** 18n,
) {
  const snapshot: EpochSnapshotTuple = [
    closedAt,
    assetsAtClose,
    supplyAtClose,
    0n,
  ]
  return [
    { status: 'success', result: snapshot },
    { status: 'success', result: claimable },
    { status: 'success', result: pendingAssets },
    { status: 'success', result: totalRedeemShares },
  ]
}

function setupMocks({
  currentEpoch = 1n,
  batchData = makeBatchResult(0n, false),
  prevSnapshotData,
}: {
  currentEpoch?: bigint
  batchData?: unknown[]
  prevSnapshotData?: EpochSnapshotTuple
} = {}) {
  mockUseReadContract.mockImplementation((opts: { functionName?: string }) => {
    if (opts.functionName === 'currentEpoch') {
      return {
        data: currentEpoch,
        isLoading: false,
        error: null,
        refetch: refetchCurrent,
      }
    }
    if (opts.functionName === 'epochSnapshot') {
      return {
        data: prevSnapshotData,
        isLoading: false,
        error: null,
        refetch: refetchPrev,
      }
    }
    return { data: undefined, isLoading: true, error: null, refetch: refetchPrev }
  })
  mockUseReadContracts.mockReturnValue({
    data: batchData,
    isLoading: false,
    error: null,
    refetch: refetchBatch,
  })
}

describe('useEpochState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  describe('open path (closedAt === 0)', () => {
    it('returns status open and isAcceptingRequests true when closedAt is 0', () => {
      setupMocks({
        currentEpoch: 1n,
        batchData: makeBatchResult(0n, false, 0n, 0n),
      })

      const { result } = renderHook(() => useEpochState())

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.status).toBe('open')
      expect(result.current.data?.isAcceptingRequests).toBe(true)
      expect(result.current.data?.epochId).toBe('1')
      expect(result.current.data?.statusSummary).toMatch(/Closes in/)
      expect(result.current.data?.endTime).toBeGreaterThanOrEqual(0)
      expect(result.current.data?.closesAtFormatted).toMatch(/\d{2} \w{3} \d{4}/)
    })

    it('does not use previous epoch closedAt=0 as startTime (avoids 1970 deposit window)', () => {
      setupMocks({
        currentEpoch: 1n,
        batchData: makeBatchResult(0n, false, 0n, 0n),
        prevSnapshotData: [0n, 10n ** 18n, 10n ** 18n, 0n],
      })

      const { result } = renderHook(() => useEpochState())

      expect(result.current.data?.closesAtFormatted).not.toMatch(/1970/)
      expect(result.current.data?.endTime ?? 0).toBeGreaterThan(1_000_000_000)
    })
  })

  describe('settling path (closedAt > 0, not claimable)', () => {
    it('returns status settling and navPerShare computed when closed but not claimable', () => {
      const closedAt = 1_700_000_000n
      const assetsAtClose = 100n * 10n ** 18n
      const supplyAtClose = 50n * 10n ** 18n
      setupMocks({
        currentEpoch: 1n,
        batchData: makeBatchResult(
          closedAt,
          false,
          0n,
          0n,
          assetsAtClose,
          supplyAtClose,
        ),
      })

      const { result } = renderHook(() => useEpochState())

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.status).toBe('settling')
      expect(result.current.data?.isAcceptingRequests).toBe(false)
      expect(result.current.data?.statusSummary).toBe('Settling')
    })
  })

  describe('claimable path (epochRedeemClaimable true)', () => {
    it('returns status claimable when epochRedeemClaimable is true', () => {
      const closedAt = 1_700_000_000n
      setupMocks({
        currentEpoch: 1n,
        batchData: makeBatchResult(closedAt, true, 5n * 10n ** 18n, 2n * 10n ** 18n),
      })

      const { result } = renderHook(() => useEpochState())

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.status).toBe('claimable')
      expect(result.current.data?.isAcceptingRequests).toBe(false)
      expect(result.current.data?.statusSummary).toMatch(/Settled/)
    })
  })

  describe('contract wiring', () => {
    it('calls useReadContract for currentEpoch and useReadContracts with epochId', () => {
      setupMocks({ currentEpoch: 2n, batchData: makeBatchResult(0n, false) })

      renderHook(() => useEpochState())

      expect(mockUseReadContract).toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'currentEpoch' }),
      )
      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          contracts: expect.arrayContaining([
            expect.objectContaining({
              functionName: 'epochSnapshot',
              args: [2n],
            }),
            expect.objectContaining({
              functionName: 'epochRedeemClaimable',
              args: [2n],
            }),
          ]),
          query: expect.objectContaining({ enabled: true }),
        }),
      )
    })

    it('calls refetch and triggers all three refetches', () => {
      setupMocks()
      const { result } = renderHook(() => useEpochState())

      result.current.refetch()

      expect(refetchCurrent).toHaveBeenCalled()
      expect(refetchBatch).toHaveBeenCalled()
      expect(refetchPrev).toHaveBeenCalled()
    })
  })

  describe('when currentEpoch is not yet loaded', () => {
    it('returns undefined data and does not enable batch', () => {
      mockUseReadContract.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: refetchCurrent,
      })
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: refetchBatch,
      })

      const { result } = renderHook(() => useEpochState())

      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ enabled: false }),
        }),
      )
    })
  })
})
