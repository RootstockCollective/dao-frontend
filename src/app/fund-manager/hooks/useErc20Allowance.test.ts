import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useErc20Allowance } from './useErc20Allowance'

const WRBTC_ADDRESS = '0x0000000000000000000000000000000000000001' as const
const SPENDER_ADDRESS = '0x0000000000000000000000000000000000000002' as const
const USER_ADDRESS = '0x0000000000000000000000000000000000000003' as const

// Module-level mocks
const mockUseAccount = vi.fn()
const mockUseReadContract = vi.fn()
const mockUseContractWrite = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useReadContract: () => mockUseReadContract(),
}))

vi.mock('@/shared/hooks/useContractWrite', () => ({
  useContractWrite: () => mockUseContractWrite(),
}))

describe('useErc20Allowance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: USER_ADDRESS })
    mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false })
    mockUseContractWrite.mockReturnValue({
      onRequestTransaction: vi.fn(),
      isRequesting: false,
      isTxPending: false,
      isTxFailed: false,
      txHash: undefined,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('allowance reading', () => {
    it('isAllowanceEnough is true when allowance >= amount', () => {
      mockUseReadContract.mockReturnValue({
        data: 1_000_000_000_000_000_000n,
        isLoading: false,
      })

      const { result } = renderHook(() => useErc20Allowance(WRBTC_ADDRESS, SPENDER_ADDRESS, '1'))
      expect(result.current.isAllowanceEnough).toBe(true)
    })

    it('isAllowanceEnough is false when allowance < amount', () => {
      mockUseReadContract.mockReturnValue({
        data: 500_000_000_000_000_000n,
        isLoading: false,
      })

      const { result } = renderHook(() => useErc20Allowance(WRBTC_ADDRESS, SPENDER_ADDRESS, '1'))
      expect(result.current.isAllowanceEnough).toBe(false)
    })

    it('isAllowanceEnough is false when amount is 0', () => {
      mockUseReadContract.mockReturnValue({
        data: 1_000_000_000_000_000_000n,
        isLoading: false,
      })

      const { result } = renderHook(() => useErc20Allowance(WRBTC_ADDRESS, SPENDER_ADDRESS, '0'))
      expect(result.current.isAllowanceEnough).toBe(false)
    })

    it('isAllowanceEnough is false when allowance data is undefined', () => {
      mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false })

      const { result } = renderHook(() => useErc20Allowance(WRBTC_ADDRESS, SPENDER_ADDRESS, '1'))
      expect(result.current.isAllowanceEnough).toBe(false)
    })
  })

  describe('approval transaction', () => {
    it('exposes onRequestAllowance from useContractWrite', () => {
      const mockOnRequest = vi.fn()
      mockUseReadContract.mockReturnValue({ data: 0n, isLoading: false })
      mockUseContractWrite.mockReturnValue({
        onRequestTransaction: mockOnRequest,
        isRequesting: false,
        isTxPending: false,
        isTxFailed: false,
        txHash: undefined,
      })

      const { result } = renderHook(() => useErc20Allowance(WRBTC_ADDRESS, SPENDER_ADDRESS, '1'))
      expect(result.current.onRequestAllowance).toBe(mockOnRequest)
    })
  })

  describe('requesting state', () => {
    it('exposes isRequesting and isTxPending from useContractWrite', () => {
      mockUseReadContract.mockReturnValue({ data: 0n, isLoading: false })
      mockUseContractWrite.mockReturnValue({
        onRequestTransaction: vi.fn(),
        isRequesting: true,
        isTxPending: true,
        isTxFailed: false,
        txHash: '0xhash' as `0x${string}`,
      })

      const { result } = renderHook(() => useErc20Allowance(WRBTC_ADDRESS, SPENDER_ADDRESS, '1'))
      expect(result.current.isRequesting).toBe(true)
      expect(result.current.isTxPending).toBe(true)
    })
  })
})
