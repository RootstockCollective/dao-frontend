import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { useAllocateVotes } from './useAllocateVotes'
import {
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
  useWriteContract,
  UseWriteContractReturnType,
} from 'wagmi'
import { renderHook } from '@testing-library/react'
import { useContext } from 'react'
import { getVoteAllocations } from '../context/utils'

vi.mock(import('wagmi'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useWriteContract: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
  }
})

vi.mock(import('react'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useContext: vi.fn(),
  }
})

vi.mock('@/app/collective-rewards/allocations/context/utils', () => ({
  getVoteAllocations: vi.fn(),
}))

describe('useAllocateVotes', () => {
  beforeEach(() => {
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue({} as UseWaitForTransactionReceiptReturnType)
  })

  describe('saveAllocations', () => {
    const writeContractAsyncSpy = vi.fn()

    beforeEach(() => {
      vi.mocked(useContext).mockReturnValue({
        initialState: {},
        state: {},
      })

      vi.mocked(useWriteContract).mockReturnValue({
        writeContractAsync: writeContractAsyncSpy,
      } as unknown as UseWriteContractReturnType)
    })

    afterEach(() => {
      writeContractAsyncSpy.mockClear()
    })

    test('should return allocate function', () => {
      vi.mocked(getVoteAllocations).mockReturnValue([['0x123'], [1n]])

      renderHook(async () => {
        const { saveAllocations } = useAllocateVotes()

        expect(typeof saveAllocations).toBe('function')

        saveAllocations()

        expect(writeContractAsyncSpy).toHaveBeenCalled()
        expect(writeContractAsyncSpy).toBeCalledWith(
          expect.objectContaining({
            functionName: 'allocate',
          }),
        )
      })
    })

    test('should return allocateBatch function', () => {
      vi.mocked(getVoteAllocations).mockReturnValue([
        ['0x123', '0x456'],
        [1n, 3n],
      ])

      renderHook(async () => {
        const { saveAllocations } = useAllocateVotes()

        expect(typeof saveAllocations).toBe('function')

        saveAllocations()

        expect(writeContractAsyncSpy).toHaveBeenCalled()
        expect(writeContractAsyncSpy).toBeCalledWith(
          expect.objectContaining({
            functionName: 'allocateBatch',
          }),
        )
      })
    })
  })
})
