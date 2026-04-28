import { readContractsQueryKey } from '@wagmi/core/query'
import { useQueryClient } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { Address } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBtcVaultActionEligibilityContracts } from './get-btc-vault-action-eligibility-contracts'
import { useBtcVaultInvalidation } from './useBtcVaultInvalidation'

const mockChainId = 30

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useChainId: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}))

const mockInvalidateQueries = vi.fn()
const mockAddress = '0x0000000000000000000000000000000000000001' as Address

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAccount).mockReturnValue({ address: mockAddress } as unknown as ReturnType<typeof useAccount>)
  vi.mocked(useChainId).mockReturnValue(mockChainId)
  vi.mocked(useQueryClient).mockReturnValue({
    invalidateQueries: mockInvalidateQueries,
  } as unknown as ReturnType<typeof useQueryClient>)
})

describe('useBtcVaultInvalidation', () => {
  describe('invalidateAfterSubmit', () => {
    it('invalidates active-requests history and eligibility readContracts', () => {
      const { result } = renderHook(() => useBtcVaultInvalidation())
      result.current.invalidateAfterSubmit()

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2)
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'active-requests-history', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: readContractsQueryKey({
          contracts: [...getBtcVaultActionEligibilityContracts(mockAddress)],
          chainId: mockChainId,
        }),
      })
    })

    it('skips readContracts invalidation when wallet address is missing', () => {
      vi.mocked(useAccount).mockReturnValue({ address: undefined } as unknown as ReturnType<typeof useAccount>)
      const { result } = renderHook(() => useBtcVaultInvalidation())
      result.current.invalidateAfterSubmit()

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1)
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'active-requests-history', undefined],
      })
    })
  })

  describe('invalidateAfterAction', () => {
    it('invalidates submit keys plus history, principal, and request detail', () => {
      const { result } = renderHook(() => useBtcVaultInvalidation())
      result.current.invalidateAfterAction('req-123')

      expect(mockInvalidateQueries).toHaveBeenCalledTimes(5)
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['btc-vault', 'active-requests-history', mockAddress],
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: readContractsQueryKey({
          contracts: [...getBtcVaultActionEligibilityContracts(mockAddress)],
          chainId: mockChainId,
        }),
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
