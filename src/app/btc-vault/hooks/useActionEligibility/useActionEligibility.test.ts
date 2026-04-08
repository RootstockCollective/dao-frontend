/**
 * useActionEligibility tests verify:
 *
 * 1. Contract wiring: the hook requests vault multicall (pause, requests, balanceOf) and uses
 *    `useWhitelistCheck` for deposit and withdrawal gating.
 * 2. Derivation: raw multicall + whitelist state map to PauseState, activeRequests, share balance,
 *    and deposit whitelist — output matches expected UI state.
 * 3. Guard clauses: when address is missing, or vault data is not yet available, the hook returns
 *    undefined data (no partial or wrong state). Whitelist loading still returns data with a
 *    loading deposit reason once vault multicall resolves.
 *
 * The mapper `toActionEligibility` is tested in mappers.test.ts; here we test that the hook
 * builds those inputs correctly from contract results.
 */
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ACTIVE_REQUEST_REASON,
  DEPOSIT_ELIGIBILITY_LOADING_REASON,
  DEPOSIT_PAUSED_REASON,
  DEPOSIT_WHITELIST_BLOCK_REASON,
  NO_VAULT_SHARES_REASON,
  WITHDRAWAL_PAUSED_REASON,
  WITHDRAWAL_WHITELIST_BLOCK_REASON,
} from '../../services/constants'
import { useActionEligibility } from './useActionEligibility'

const USER_ADDRESS = '0x1234567890123456789012345678901234567890'

const mockUseReadContracts = vi.fn()
const mockUseWhitelistCheck = vi.fn()

vi.mock('wagmi', () => ({
  useReadContracts: (args: unknown) => mockUseReadContracts(args),
}))

vi.mock('@/app/btc-vault/hooks/useWhitelistCheck', () => ({
  useWhitelistCheck: () => mockUseWhitelistCheck(),
}))

function makeVaultResults({
  depositPaused = false,
  redeemPaused = false,
  depositAssets = 0n,
  depositEpochId = 0n,
  redeemShares = 0n,
  redeemEpochId = 0n,
  /** Default 1 wei so `hasVaultShares` is true unless a test overrides. */
  vaultBalance = 1n,
  balanceSlotStatus = 'success' as 'success' | 'failure',
}: {
  depositPaused?: boolean
  redeemPaused?: boolean
  depositAssets?: bigint
  depositEpochId?: bigint
  redeemShares?: bigint
  redeemEpochId?: bigint
  vaultBalance?: bigint
  balanceSlotStatus?: 'success' | 'failure'
} = {}) {
  return [
    { status: 'success', result: depositPaused },
    { status: 'success', result: redeemPaused },
    { status: 'success', result: [depositEpochId, depositAssets] as readonly [bigint, bigint] },
    { status: 'success', result: [redeemEpochId, redeemShares] as readonly [bigint, bigint] },
    balanceSlotStatus === 'success'
      ? { status: 'success' as const, result: vaultBalance }
      : { status: 'failure' as const },
  ]
}

const vaultRefetch = vi.fn()
const whitelistRefetch = vi.fn()

function setupMocks(
  vaultData = makeVaultResults(),
  whitelist: { isWhitelisted: boolean; isLoading: boolean } = { isWhitelisted: true, isLoading: false },
) {
  mockUseReadContracts.mockReturnValue({
    data: vaultData,
    isLoading: false,
    error: null,
    refetch: vaultRefetch,
  })
  mockUseWhitelistCheck.mockReturnValue({
    ...whitelist,
    refetch: whitelistRefetch,
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
      expect(mockUseReadContracts).toHaveBeenCalledWith(expect.objectContaining({ contracts: undefined }))
    })
  })

  describe('contract wiring', () => {
    it('requests multicall with 5 vault reads including balanceOf(user)', () => {
      renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(mockUseReadContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          contracts: expect.arrayContaining([
            expect.objectContaining({ functionName: 'depositRequestsPaused' }),
            expect.objectContaining({ functionName: 'redeemRequestsPaused' }),
            expect.objectContaining({
              functionName: 'asyncDepositRequests',
              args: [USER_ADDRESS],
            }),
            expect.objectContaining({
              functionName: 'asyncRedeemRequests',
              args: [USER_ADDRESS],
            }),
            expect.objectContaining({
              functionName: 'balanceOf',
              args: [USER_ADDRESS],
            }),
          ]),
          query: expect.objectContaining({ enabled: true }),
        }),
      )
      const { contracts } = mockUseReadContracts.mock.calls[0][0] as { contracts: unknown[] }
      expect(contracts).toHaveLength(5)
    })

    it('refetch calls both multicall and whitelist refetches', () => {
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))
      result.current.refetch()

      expect(vaultRefetch).toHaveBeenCalledOnce()
      expect(whitelistRefetch).toHaveBeenCalledOnce()
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
      mockUseWhitelistCheck.mockReturnValue({
        isWhitelisted: true,
        isLoading: false,
        refetch: whitelistRefetch,
      })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeUndefined()
    })

    it('returns data with loading deposit reason when vault is ready but whitelist is loading', () => {
      setupMocks(makeVaultResults(), { isWhitelisted: false, isLoading: true })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(DEPOSIT_ELIGIBILITY_LOADING_REASON)
    })

    it('treats failed multicall slot as paused (fail-closed)', () => {
      setupMocks(
        [
          { status: 'success', result: false },
          { status: 'failure' },
          { status: 'success', result: [0n, 0n] as readonly [bigint, bigint] },
          { status: 'success', result: [0n, 0n] as readonly [bigint, bigint] },
          { status: 'success', result: 1n },
        ],
        { isWhitelisted: true, isLoading: false },
      )

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
          { status: 'success', result: 1n },
        ],
        isLoading: false,
        error: null,
        refetch: vaultRefetch,
      })
      mockUseWhitelistCheck.mockReturnValue({
        isWhitelisted: true,
        isLoading: false,
        refetch: whitelistRefetch,
      })

      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.depositBlockReason).toBe(DEPOSIT_PAUSED_REASON)
      expect(result.current.data?.canDeposit).toBe(false)
    })
  })

  describe('derivation from contract results', () => {
    it('returns all allowed when pause active, whitelisted, no active requests', () => {
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.canDeposit).toBe(true)
      expect(result.current.data?.canWithdraw).toBe(true)
      expect(result.current.data?.depositBlockReason).toBe('')
      expect(result.current.data?.withdrawBlockReason).toBe('')
      expect(result.current.data?.pauseState).toEqual({ deposits: 'active', withdrawals: 'active' })
    })

    it('disables deposit with reason when deposits paused', () => {
      setupMocks(makeVaultResults({ depositPaused: true }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(DEPOSIT_PAUSED_REASON)
      expect(result.current.data?.canWithdraw).toBe(true)
      expect(result.current.data?.pauseState).toEqual({ deposits: 'paused', withdrawals: 'active' })
    })

    it('disables withdraw with reason when withdrawals paused', () => {
      setupMocks(makeVaultResults({ redeemPaused: true }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(true)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.withdrawBlockReason).toBe(WITHDRAWAL_PAUSED_REASON)
    })

    it('disables deposit and withdraw with whitelist reason when not whitelisted', () => {
      setupMocks(makeVaultResults(), { isWhitelisted: false, isLoading: false })
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(DEPOSIT_WHITELIST_BLOCK_REASON)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.withdrawBlockReason).toBe(WITHDRAWAL_WHITELIST_BLOCK_REASON)
    })

    it('disables withdraw with NO_VAULT_SHARES_REASON when balanceOf is zero', () => {
      setupMocks(makeVaultResults({ vaultBalance: 0n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(true)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.withdrawBlockReason).toBe(NO_VAULT_SHARES_REASON)
    })

    it('disables withdraw when balanceOf slot fails (fail-closed to no shares)', () => {
      setupMocks(makeVaultResults({ balanceSlotStatus: 'failure' }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.withdrawBlockReason).toBe(NO_VAULT_SHARES_REASON)
    })

    it('disables both buttons with active request reason when user has active deposit', () => {
      setupMocks(makeVaultResults({ depositAssets: 1_000_000_000_000_000_000n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(ACTIVE_REQUEST_REASON)
      expect(result.current.data?.withdrawBlockReason).toBe(ACTIVE_REQUEST_REASON)
    })

    it('disables both buttons with active request reason when user has active redeem', () => {
      setupMocks(makeVaultResults({ redeemShares: 500_000_000_000_000_000n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.canWithdraw).toBe(false)
      expect(result.current.data?.depositBlockReason).toBe(ACTIVE_REQUEST_REASON)
      expect(result.current.data?.withdrawBlockReason).toBe(ACTIVE_REQUEST_REASON)
    })

    it('disables both when user has both active deposit and redeem', () => {
      setupMocks(makeVaultResults({ depositAssets: 1n, redeemShares: 1n }))
      const { result } = renderHook(() => useActionEligibility(USER_ADDRESS))

      expect(result.current.data?.canDeposit).toBe(false)
      expect(result.current.data?.canWithdraw).toBe(false)
    })
  })
})
