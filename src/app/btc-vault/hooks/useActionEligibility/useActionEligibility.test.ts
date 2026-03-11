import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useActionEligibility } from './useActionEligibility'

const mockUseReadContracts = vi.fn()
vi.mock('wagmi', () => ({
  useReadContracts: (...args: unknown[]) => mockUseReadContracts(...args),
}))

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as const

function successResult<T>(value: T) {
  return { result: value, status: 'success' as const }
}

function buildMulticallData({
  depositsPaused = false,
  redeemsPaused = false,
  depositReq = [0n, 0n] as readonly [bigint, bigint],
  redeemReq = [0n, 0n] as readonly [bigint, bigint],
} = {}) {
  return [
    successResult(depositsPaused),
    successResult(redeemsPaused),
    successResult(depositReq),
    successResult(redeemReq),
  ]
}

describe('useActionEligibility', () => {
  it('returns deposits paused when depositRequestsPaused is true', () => {
    mockUseReadContracts.mockReturnValue({
      data: buildMulticallData({ depositsPaused: true }),
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.data?.canDeposit).toBe(false)
    expect(result.current.data?.depositBlockReason).toBe('Deposits are currently paused')
    expect(result.current.data?.canWithdraw).toBe(true)
  })

  it('returns withdrawals paused when redeemRequestsPaused is true', () => {
    mockUseReadContracts.mockReturnValue({
      data: buildMulticallData({ redeemsPaused: true }),
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.data?.canWithdraw).toBe(false)
    expect(result.current.data?.withdrawBlockReason).toBe('Withdrawals are currently paused')
    expect(result.current.data?.canDeposit).toBe(true)
  })

  it('returns both paused when both pause functions return true', () => {
    mockUseReadContracts.mockReturnValue({
      data: buildMulticallData({ depositsPaused: true, redeemsPaused: true }),
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.data?.canDeposit).toBe(false)
    expect(result.current.data?.canWithdraw).toBe(false)
    expect(result.current.data?.depositBlockReason).toBe('Deposits are currently paused')
    expect(result.current.data?.withdrawBlockReason).toBe('Withdrawals are currently paused')
  })

  it('blocks both actions when user has active deposit request', () => {
    mockUseReadContracts.mockReturnValue({
      data: buildMulticallData({ depositReq: [1n, 500n] }),
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.data?.canDeposit).toBe(false)
    expect(result.current.data?.canWithdraw).toBe(false)
    expect(result.current.data?.depositBlockReason).toBe('You already have an active request')
    expect(result.current.data?.withdrawBlockReason).toBe('You already have an active request')
  })

  it('blocks both actions when user has active redeem request', () => {
    mockUseReadContracts.mockReturnValue({
      data: buildMulticallData({ redeemReq: [2n, 300n] }),
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.data?.canDeposit).toBe(false)
    expect(result.current.data?.canWithdraw).toBe(false)
    expect(result.current.data?.depositBlockReason).toBe('You already have an active request')
    expect(result.current.data?.withdrawBlockReason).toBe('You already have an active request')
  })

  it('allows both actions when nothing is paused and no active requests', () => {
    mockUseReadContracts.mockReturnValue({
      data: buildMulticallData(),
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.data?.canDeposit).toBe(true)
    expect(result.current.data?.canWithdraw).toBe(true)
    expect(result.current.data?.depositBlockReason).toBe('')
    expect(result.current.data?.withdrawBlockReason).toBe('')
  })

  it('returns undefined data when no address is provided', () => {
    mockUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(undefined))

    expect(result.current.data).toBeUndefined()
  })

  it('returns isLoading true and undefined data while loading', () => {
    mockUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const { result } = renderHook(() => useActionEligibility(ADDRESS))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
