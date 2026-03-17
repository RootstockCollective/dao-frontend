/**
 * useActionEligibility tests verify:
 *
 * 1. Contract wiring: the hook requests the right data (multicall with 5 vault reads,
 *    then hasRole on PermissionsManager) and passes the right args (e.g. user address).
 * 2. Derivation: raw multicall + hasRole results are mapped to PauseState, EligibilityStatus,
 *    and activeRequests and fed to toActionEligibility — output matches expected UI state.
 * 3. Guard clauses: when address is missing, or vault/hasRole data is not yet available,
 *    the hook returns undefined data (no partial or wrong state).
 *
 * The mapper toActionEligibility(pause, eligibility, activeRequests) is tested in
 * mappers.test.ts; here we test that the hook builds those inputs correctly from contract results.
 */
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WHITELISTED_USER_ROLE } from '@/lib/constants'
import {
  DEPOSIT_PAUSED_REASON,
  NOT_WHITELISTED_REASON,
  WITHDRAWAL_PAUSED_REASON,
} from '../../services/constants'
import { useActionEligibility } from './useActionEligibility'

const PM_ADDRESS = '0x0000000000000000000000000000000000000001'
const USER_ADDRESS = '0x1234567890123456789012345678901234567890'

const mockUseReadContracts = vi.fn()
const mockUseReadContract = vi.fn()

vi.mock('wagmi', () => ({
  useReadContracts: (args: unknown) => mockUseReadContracts(args),
  useReadContract: (args: unknown) => mockUseReadContract(args),
}))

function makeVaultResults({
  depositPaused = false,
  redeemPaused = false,
  depositAssets = 0n,
  depositEpochId = 0n,
  redeemShares = 0n,
  redeemEpochId = 0n,
}: {
  depositPaused?: boolean
  redeemPaused?: boolean
  depositAssets?: bigint
  depositEpochId?: bigint
  redeemShares?: bigint
  redeemEpochId?: bigint
} = {}) {
  return [
    { status: 'success', result: depositPaused },
    { status: 'success', result: redeemPaused },
    { status: 'success', result: [depositEpochId, depositAssets] as readonly [bigint, bigint] },
    { status: 'success', result: [redeemEpochId, redeemShares] as readonly [bigint, bigint] },
    { status: 'success', result: PM_ADDRESS },
  ]
}

const vaultRefetch = vi.fn()
const roleRefetch = vi.fn()

function setupMocks(
  vaultData = makeVaultResults(),
  hasRole: boolean | undefined = true,
) {
  mockUseReadContracts.mockReturnValue({
    data: vaultData,
    isLoading: false,
    error: null,
    refetch: vaultRefetch,
  })
  mockUseReadContract.mockReturnValue({
    data: hasRole,
    isLoading: false,
    error: null,
    refetch: roleRefetch,
  })
}

describe('useActionEligibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  describe('when address is undefined', () => {
    it('returns undefined data and does not request vault contracts', () => {
      const { result } = renderHook(() => useActionEligibility(undefined))

      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({ contracts: undefined }),
      )
    })
  })

  describe('contract wiring', () => {
    it('requests multicall with 5 vault reads and user address for depositReq/redeemReq', () => {
      renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          contracts: expect.arrayContaining([
            expect.objectContaining({ functionName: 'depositRequestsPaused' }),
            expect.objectContaining({ functionName: 'redeemRequestsPaused' }),
            expect.objectContaining({
              functionName: 'depositReq',
              args: [USER_ADDRESS],
            }),
            expect.objectContaining({
              functionName: 'redeemReq',
              args: [USER_ADDRESS],
            }),
            expect.objectContaining({ functionName: 'permissionsManager' }),
          ]),
          query: expect.objectContaining({ enabled: true }),
        }),
      )
      const { contracts } = mockUseReadContracts.mock.calls[0][0] as { contracts: unknown[] }
      expect(contracts).toHaveLength(5)
    })

    it('requests hasRole on PermissionsManager with WHITELISTED_USER_ROLE and user address', () => {
      setupMocks(makeVaultResults())
      renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(mockUseReadContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: PM_ADDRESS,
          functionName: 'hasRole',
          args: [WHITELISTED_USER_ROLE, USER_ADDRESS],
          query: expect.objectContaining({ enabled: true }),
        }),
      )
    })

    it('refetch calls both multicall and hasRole refetches', () => {
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))
      result.current.refetch()

      expect(vaultRefetch).toHaveBeenCalledOnce()
      expect(roleRefetch).toHaveBeenCalledOnce()
    })
  })

  describe('guard clauses', () => {
    it('returns undefined data when vault multicall has not returned yet', () => {
      mockUseReadContracts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vaultRefetch,
      })
      mockUseReadContract.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        refetch: roleRefetch,
      })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeUndefined()
    })

    it('returns undefined data when hasRole has not returned yet', () => {
      setupMocks(makeVaultResults())
      mockUseReadContract.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: roleRefetch,
      })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeUndefined()
    })

    it('treats failed multicall slot as paused (fail-closed)', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'success', result: false },
          { status: 'failure' },
          { status: 'success', result: [0n, 0n] as readonly [bigint, bigint] },
          { status: 'success', result: [0n, 0n] as readonly [bigint, bigint] },
          { status: 'success', result: PM_ADDRESS },
        ],
        isLoading: false,
        error: null,
        refetch: vaultRefetch,
      })
      mockUseReadContract.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        refetch: roleRefetch,
      })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.withdrawBlockReason).toBe(WITHDRAWAL_PAUSED_REASON)
      expect(result.current.data?.canWithdraw).toBe(false)
    })

    it('treats failed deposit-pause slot as paused (fail-closed)', () => {
      mockUseReadContracts.mockReturnValue({
        data: [
          { status: 'failure' },
          { status: 'success', result: false },
          { status: 'success', result: [0n, 0n] as readonly [bigint, bigint] },
          { status: 'success', result: [0n, 0n] as readonly [bigint, bigint] },
          { status: 'success', result: PM_ADDRESS },
        ],
        isLoading: false,
        error: null,
        refetch: vaultRefetch,
      })
      mockUseReadContract.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        refetch: roleRefetch,
      })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.depositBlockReason).toBe(DEPOSIT_PAUSED_REASON)
      expect(result.current.data?.canDeposit).toBe(false)
    })
  })

  describe('derivation from contract results', () => {
    it('returns all allowed when pause active, eligible, no active requests', () => {
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.canDeposit).toBe(true)
      expect(result.current.data?.canWithdraw).toBe(true)
      expect(result.current.data?.depositBlockReason).toBe('')
      expect(result.current.data?.withdrawBlockReason).toBe('')
    })

    it('disables deposit with reason when deposits paused', () => {
      setupMocks(makeVaultResults({ depositPaused: true }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(DEPOSIT_PAUSED_REASON)
      expect(result.current.data?.canWithdraw).toBe(true)
    })

    it('disables withdraw with reason when withdrawals paused', () => {
      setupMocks(makeVaultResults({ redeemPaused: true }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(true)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.withdrawBlockReason).toBe(WITHDRAWAL_PAUSED_REASON)
    })

    it('disables deposit with NOT_WHITELISTED_REASON when not whitelisted', () => {
      setupMocks(makeVaultResults(), false)
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(NOT_WHITELISTED_REASON)
      expect(result.current.data?.canWithdraw).toBe(true)
    })

    it('disables both buttons with active request reason when user has active deposit', () => {
      setupMocks(makeVaultResults({ depositAssets: 1_000_000_000_000_000_000n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe('You already have an active request')
      expect(result.current.data?.withdrawBlockReason).toBe('You already have an active request')
    })

    it('disables both buttons with active request reason when user has active redeem', () => {
      setupMocks(makeVaultResults({ redeemShares: 500_000_000_000_000_000n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe('You already have an active request')
      expect(result.current.data?.withdrawBlockReason).toBe('You already have an active request')
    })

    it('disables both when user has both active deposit and redeem', () => {
      setupMocks(makeVaultResults({ depositAssets: 1n, redeemShares: 1n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.canWithdraw).toBe(false)
    })
  })
})
