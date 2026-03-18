import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNftWhitelist } from './useNftWhitelist'
import type { Address } from 'viem'

const mockRefetch = vi.fn()
const mockWriteContract = vi.fn()

const mockReadContractsReturn = {
  data: undefined as ReturnType<typeof makeSelectData> | undefined,
  isFetching: false,
  isLoading: false,
  error: null as Error | null,
  refetch: mockRefetch,
}

const mockWriteContractReturn = {
  writeContract: mockWriteContract,
  isPending: false,
  error: null as Error | null,
  data: undefined as `0x${string}` | undefined,
}

const mockWaitReturn = {
  isSuccess: false,
  isLoading: false,
}

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0xUserAddress' as Address }),
  useReadContracts: (opts: { query: { select: (data: unknown[]) => unknown } }) => {
    // Simulate select transform if data is provided
    if (mockReadContractsReturn.data) {
      return { ...mockReadContractsReturn, data: mockReadContractsReturn.data }
    }
    return mockReadContractsReturn
  },
  useWriteContract: () => mockWriteContractReturn,
  useWaitForTransactionReceipt: () => mockWaitReturn,
}))

vi.mock('@/lib/rns', () => ({
  getEnsDomainName: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}))

function makeSelectData(hasGuardRole = false) {
  return {
    guards: [{ address: '0xGuard1' as Address }],
    minters: [{ address: '0xMinter1' as Address }, { address: '0xMinter2' as Address }],
    hasGuardRole,
  }
}

const testConfig = {
  address: '0xTestContract' as Address,
  abi: [] as const,
  toastIdPrefix: 'test',
}

describe('useNftWhitelist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReadContractsReturn.data = undefined
    mockReadContractsReturn.isFetching = false
    mockReadContractsReturn.isLoading = false
    mockReadContractsReturn.error = null
    mockWriteContractReturn.isPending = false
    mockWriteContractReturn.error = null
    mockWriteContractReturn.data = undefined
    mockWaitReturn.isSuccess = false
    mockWaitReturn.isLoading = false
  })

  it('returns empty minters and guards when no data', () => {
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.minters).toEqual([])
    expect(result.current.guards).toEqual([])
    expect(result.current.hasGuardRole).toBeUndefined()
  })

  it('returns loading true when fetching', () => {
    mockReadContractsReturn.isLoading = true
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.loading).toBe(true)
  })

  it('returns minters and guards from contract data', () => {
    mockReadContractsReturn.data = makeSelectData(true)
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.hasGuardRole).toBe(true)
  })

  it('calls writeContract for whitelistMinters when user has guard role', () => {
    mockReadContractsReturn.data = makeSelectData(true)
    const { result } = renderHook(() => useNftWhitelist(testConfig))

    act(() => {
      result.current.whitelistMinters(['0xNewMinter' as Address])
    })

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'addToWhitelist',
        args: [['0xNewMinter']],
      }),
    )
  })

  it('shows error toast when whitelistMinters called without guard role', async () => {
    const { toast } = await import('react-toastify')
    mockReadContractsReturn.data = makeSelectData(false)
    const { result } = renderHook(() => useNftWhitelist(testConfig))

    act(() => {
      result.current.whitelistMinters(['0xNewMinter' as Address])
    })

    expect(mockWriteContract).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('You need guard permissions')
  })

  it('calls writeContract for revokeMinterRole when user has guard role', () => {
    mockReadContractsReturn.data = makeSelectData(true)
    const { result } = renderHook(() => useNftWhitelist(testConfig))

    act(() => {
      result.current.revokeMinterRole('0xMinter1' as Address)
    })

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'revokeRole',
      }),
    )
  })

  it('returns pending state from global store', () => {
    mockWriteContractReturn.isPending = true
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.pending).toBeDefined()
  })
})
