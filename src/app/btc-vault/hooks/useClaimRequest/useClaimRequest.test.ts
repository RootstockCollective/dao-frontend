import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { VaultRequest } from '../../services/types'
import { useClaimRequest } from './useClaimRequest'

const mockUseAccount = vi.fn()
const mockUseReadContract = vi.fn()
const mockOnFinalizeDeposit = vi.fn()
const mockOnFinalizeWithdrawal = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useReadContract: (args: unknown) => mockUseReadContract(args),
}))

vi.mock('../useFinalizeDeposit', () => ({
  useFinalizeDeposit: () => ({
    onFinalizeDeposit: mockOnFinalizeDeposit,
    isRequesting: false,
    isTxPending: false,
    isTxFailed: false,
    finalizeTxHash: undefined,
  }),
}))

vi.mock('../useFinalizeWithdrawal', () => ({
  useFinalizeWithdrawal: () => ({
    onFinalizeWithdrawal: mockOnFinalizeWithdrawal,
    isRequesting: false,
    isTxPending: false,
    isTxFailed: false,
    finalizeTxHash: undefined,
  }),
}))

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'
const ONE_BTC = 10n ** 18n

const CLAIMABLE_DEPOSIT: VaultRequest = {
  id: 'dep-1',
  type: 'deposit',
  amount: ONE_BTC,
  status: 'claimable',
  displayStatus: 'open_to_claim',
  epochId: '3',
  batchRedeemId: null,
  timestamps: { created: 1700000000 },
  txHashes: {},
}

const CLAIMABLE_WITHDRAWAL: VaultRequest = {
  id: 'red-2',
  type: 'withdrawal',
  amount: ONE_BTC / 2n,
  status: 'claimable',
  displayStatus: 'claim_pending',
  epochId: null,
  batchRedeemId: '5',
  timestamps: { created: 1700000000 },
  txHashes: {},
}

const PENDING_REQUEST: VaultRequest = {
  id: 'req-p',
  type: 'withdrawal',
  amount: ONE_BTC,
  status: 'pending',
  epochId: null,
  batchRedeemId: '1',
  timestamps: { created: 1700000000 },
  txHashes: {},
}

describe('useClaimRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: ADDRESS })
    mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false, isError: false })
  })

  it('does not enable contract read for non-claimable requests', () => {
    renderHook(() => useClaimRequest(PENDING_REQUEST))
    const callArgs = mockUseReadContract.mock.calls[0][0]
    expect(callArgs.query.enabled).toBe(false)
  })

  it('enables contract read for claimable deposit with correct functionName and args', () => {
    mockUseReadContract.mockReturnValue({ data: ONE_BTC, isLoading: false })
    renderHook(() => useClaimRequest(CLAIMABLE_DEPOSIT))
    const callArgs = mockUseReadContract.mock.calls[0][0]
    expect(callArgs.functionName).toBe('claimableDepositRequest')
    expect(callArgs.args).toEqual([ADDRESS])
    expect(callArgs.query.enabled).toBe(true)
  })

  it('enables contract read for claimable withdrawal with correct functionName and args', () => {
    mockUseReadContract.mockReturnValue({ data: ONE_BTC / 2n, isLoading: false })
    renderHook(() => useClaimRequest(CLAIMABLE_WITHDRAWAL))
    const callArgs = mockUseReadContract.mock.calls[0][0]
    expect(callArgs.functionName).toBe('claimableRedeemRequest')
    expect(callArgs.args).toEqual([ADDRESS])
    expect(callArgs.query.enabled).toBe(true)
  })

  it('canClaim is true when claimable amount > 0', () => {
    mockUseReadContract.mockReturnValue({ data: ONE_BTC, isLoading: false })
    const { result } = renderHook(() => useClaimRequest(CLAIMABLE_DEPOSIT))
    expect(result.current.canClaim).toBe(true)
  })

  it('canClaim is false when claimable amount is 0', () => {
    mockUseReadContract.mockReturnValue({ data: 0n, isLoading: false })
    const { result } = renderHook(() => useClaimRequest(CLAIMABLE_DEPOSIT))
    expect(result.current.canClaim).toBe(false)
  })

  it('canClaim is false for null request', () => {
    const { result } = renderHook(() => useClaimRequest(null))
    expect(result.current.canClaim).toBe(false)
  })

  it('claim() calls onFinalizeDeposit for deposit requests', async () => {
    mockUseReadContract.mockReturnValue({ data: ONE_BTC, isLoading: false })
    mockOnFinalizeDeposit.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useClaimRequest(CLAIMABLE_DEPOSIT))
    await result.current.claim()

    expect(mockOnFinalizeDeposit).toHaveBeenCalledWith()
    expect(mockOnFinalizeWithdrawal).not.toHaveBeenCalled()
  })

  it('claim() calls onFinalizeWithdrawal for withdrawal requests', async () => {
    mockUseReadContract.mockReturnValue({ data: ONE_BTC / 2n, isLoading: false })
    mockOnFinalizeWithdrawal.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useClaimRequest(CLAIMABLE_WITHDRAWAL))
    await result.current.claim()

    expect(mockOnFinalizeWithdrawal).toHaveBeenCalledWith()
    expect(mockOnFinalizeDeposit).not.toHaveBeenCalled()
  })

  it('claim() rejects when no claimable amount', async () => {
    mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false, isError: false })

    const { result } = renderHook(() => useClaimRequest(CLAIMABLE_DEPOSIT))
    await expect(result.current.claim()).rejects.toThrow('No claimable amount available')
  })

  it('canClaim is false and isReadingError when contract read fails', () => {
    mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    const { result } = renderHook(() => useClaimRequest(CLAIMABLE_DEPOSIT))
    expect(result.current.isReadingError).toBe(true)
    expect(result.current.canClaim).toBe(false)
  })
})
