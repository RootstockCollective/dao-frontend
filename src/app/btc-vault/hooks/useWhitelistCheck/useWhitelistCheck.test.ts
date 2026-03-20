import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useWhitelistCheck } from './useWhitelistCheck'

const mockUseAccount = vi.fn()
const mockUseReadContract = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: (...args: unknown[]) => mockUseAccount(...args),
  useReadContract: (...args: unknown[]) => mockUseReadContract(...args),
}))

vi.mock('@/lib/contracts', () => ({
  permissionsManager: {
    address: '0x0000000000000000000000000000000000000001',
    abi: [],
  },
}))

const CONNECTED_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

function setupMocks({
  address,
  hasRoleData,
  isLoading = false,
}: {
  address: string | undefined
  hasRoleData?: boolean
  isLoading?: boolean
} = { address: undefined }) {
  mockUseAccount.mockReturnValue({ address })
  mockUseReadContract.mockReturnValue({
    data: hasRoleData,
    isLoading,
    isError: false,
    refetch: vi.fn(),
  })
}

describe('useWhitelistCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks({ address: undefined })
  })

  describe('return shape', () => {
    it('returns { isWhitelisted, isLoading, refetch }', () => {
      const { result } = renderHook(() => useWhitelistCheck())

      expect(result.current).toHaveProperty('isWhitelisted')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('refetch')
      expect(typeof result.current.isWhitelisted).toBe('boolean')
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('when wallet is disconnected', () => {
    it('returns isWhitelisted false and isLoading false', () => {
      setupMocks({ address: undefined })

      const { result } = renderHook(() => useWhitelistCheck())

      expect(result.current.isWhitelisted).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('passes enabled: false to useReadContract when address is undefined', () => {
      setupMocks({ address: undefined })

      renderHook(() => useWhitelistCheck())

      expect(mockUseReadContract).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ enabled: false }),
        }),
      )
    })
  })

  describe('when wallet is connected', () => {
    it('returns isWhitelisted true when contract returns true', () => {
      setupMocks({ address: CONNECTED_ADDRESS, hasRoleData: true })

      const { result } = renderHook(() => useWhitelistCheck())

      expect(result.current.isWhitelisted).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('returns isWhitelisted false when contract returns false', () => {
      setupMocks({ address: CONNECTED_ADDRESS, hasRoleData: false })

      const { result } = renderHook(() => useWhitelistCheck())

      expect(result.current.isWhitelisted).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('passes enabled: true to useReadContract when address is set', () => {
      setupMocks({ address: CONNECTED_ADDRESS, hasRoleData: false })

      renderHook(() => useWhitelistCheck())

      expect(mockUseReadContract).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ enabled: true }),
        }),
      )
    })

    it('returns isLoading true while contract read is loading', () => {
      setupMocks({ address: CONNECTED_ADDRESS, isLoading: true })

      const { result } = renderHook(() => useWhitelistCheck())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isWhitelisted).toBe(false)
    })

    it('returns isLoading false when data is resolved', () => {
      setupMocks({ address: CONNECTED_ADDRESS, hasRoleData: true, isLoading: false })

      const { result } = renderHook(() => useWhitelistCheck())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isWhitelisted).toBe(true)
    })
  })
})
