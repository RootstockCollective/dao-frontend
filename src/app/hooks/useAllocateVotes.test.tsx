import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { useAllocateVotes } from '@/app/hooks'
import {
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
  useWriteContract,
  UseWriteContractReturnType,
} from 'wagmi'
import { renderHook } from '@testing-library/react'
import { useContext } from 'react'
import { getVoteAllocations } from '@/app/context/allocations/utils'

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

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('saveAllocations', () => {
    const writeContractAsyncSpy = vi.fn()
    const isValidStateMock = vi.fn()

    beforeEach(() => {
      vi.mocked(useContext).mockReturnValue({
        initialState: {},
        state: { isValidState: isValidStateMock.mockReturnValue(true), refetchRawAllocations: vi.fn() },
      } as unknown as ReturnType<typeof useContext>)

      vi.mocked(useWriteContract).mockReturnValue({
        writeContractAsync: writeContractAsyncSpy,
      } as unknown as UseWriteContractReturnType)
    })

    afterEach(() => {
      writeContractAsyncSpy.mockClear()
    })

    test('should call contract with allocate function in args', () => {
      vi.mocked(getVoteAllocations).mockReturnValue([['0x123'], [1n]])

      renderHook(() => {
        const { saveAllocations } = useAllocateVotes()

        saveAllocations()

        expect(writeContractAsyncSpy).toBeCalledWith(
          expect.objectContaining({
            functionName: 'allocate',
          }),
        )
      })
    })

    test('should call contract with allocateBatch function in args', () => {
      vi.mocked(getVoteAllocations).mockReturnValue([
        ['0x123', '0x456'],
        [1n, 3n],
      ])

      renderHook(async () => {
        const { saveAllocations } = useAllocateVotes()

        saveAllocations()

        expect(writeContractAsyncSpy).toBeCalledWith(
          expect.objectContaining({
            functionName: 'allocateBatch',
          }),
        )
      })
    })

    test('should not call contract if there are no allocations to save', () => {
      vi.mocked(getVoteAllocations).mockReturnValue([[], []])

      renderHook(async () => {
        const { saveAllocations } = useAllocateVotes()

        saveAllocations()

        expect(writeContractAsyncSpy).not.toBeCalled()
      })
    })

    test('should not call contract and getVoteAllocations if state is not valid', () => {
      isValidStateMock.mockReturnValue(false)

      renderHook(async () => {
        const { saveAllocations } = useAllocateVotes()

        saveAllocations()

        expect(writeContractAsyncSpy).not.toBeCalled()
        expect(getVoteAllocations).not.toBeCalled()
      })
    })
  })
})
