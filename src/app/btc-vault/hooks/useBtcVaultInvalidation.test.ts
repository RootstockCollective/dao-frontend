import { useQueryClient } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { useAccount } from 'wagmi'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useBtcVaultInvalidation } from './useBtcVaultInvalidation'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}))

const mockInvalidateQueries = vi.fn()
const mockAddress = '0xUserAddress'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAccount).mockReturnValue({ address: mockAddress } as unknown as ReturnType<typeof useAccount>)
  vi.mocked(useQueryClient).mockReturnValue({
    invalidateQueries: mockInvalidateQueries,
  } as unknown as ReturnType<typeof useQueryClient>)
})

describe('useBtcVaultInvalidation', () => {
  describe('invalidateAfterSubmit', () => {
    it('invalidates active-requests and action-eligibility', () => {
      const { result } = renderHook(() => useBtcVaultInvalidation())
      result.current.invalidateAfterSubmit()

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2)
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'active-requests', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'action-eligibility', mockAddress],
      })
    })
  })

  describe('invalidateAfterAction', () => {
    it('invalidates submit keys plus history, principal, and request detail', () => {
      const { result } = renderHook(() => useBtcVaultInvalidation())
      result.current.invalidateAfterAction('req-123')

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(5)
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'active-requests', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'action-eligibility', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'history', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'principal', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'request', 'req-123', mockAddress],
      })
    })

    it('skips request detail invalidation when no requestId is provided', () => {
      const { result } = renderHook(() => useBtcVaultInvalidation())
      result.current.invalidateAfterAction()

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(4)
      expect(mockInvalidateQueries).not.toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: expect.arrayContaining(['request']) }),
      )
    })
  })
})
