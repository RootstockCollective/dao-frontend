// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import type { Address } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useNftWhitelist } from './useNftWhitelist'

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
  useReadContracts: () => {
    if (mockReadContractsReturn.data) {
      return { ...mockReadContractsReturn, data: mockReadContractsReturn.data }
    }
    return mockReadContractsReturn
  },
  useWriteContract: () => mockWriteContractReturn,
  useWaitForTransactionReceipt: () => mockWaitReturn,
}))

const mockGetEnsDomainName = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/rns', () => ({
  getEnsDomainName: (...args: unknown[]) => mockGetEnsDomainName(...args),
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

/** Flush pending microtasks so async effects (RNS enrichment) settle before teardown. */
const flushPromises = () => act(() => new Promise(resolve => setTimeout(resolve, 50)))

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

  afterEach(async () => {
    cleanup()
    await flushPromises()
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

  it('returns loading true when isFetching is true', () => {
    mockReadContractsReturn.isFetching = true
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.loading).toBe(true)
  })

  it('returns minters and guards from contract data', async () => {
    mockReadContractsReturn.data = makeSelectData(true)
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.hasGuardRole).toBe(true)
  })

  it('returns hasGuardRole false when user is not a guard', async () => {
    mockReadContractsReturn.data = makeSelectData(false)
    const { result } = renderHook(() => useNftWhitelist(testConfig))
    expect(result.current.hasGuardRole).toBe(false)
  })

  it('calls writeContract for whitelistMinters when user has guard role', async () => {
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

  it('shows error toast when revokeMinterRole called without guard role', async () => {
    const { toast } = await import('react-toastify')
    mockReadContractsReturn.data = makeSelectData(false)
    const { result } = renderHook(() => useNftWhitelist(testConfig))

    act(() => {
      result.current.revokeMinterRole('0xMinter1' as Address)
    })

    expect(mockWriteContract).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('You need guard permissions')
  })

  it('calls writeContract for revokeMinterRole when user has guard role', async () => {
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

  it('triggers RNS enrichment when data is available', async () => {
    mockGetEnsDomainName.mockResolvedValue('alice.rsk')
    mockReadContractsReturn.data = makeSelectData(true)

    renderHook(() => useNftWhitelist(testConfig))

    await vi.waitFor(() => {
      expect(mockGetEnsDomainName).toHaveBeenCalled()
    })
  })

  it('calls getEnsDomainName for all minter and guard addresses', async () => {
    mockGetEnsDomainName.mockResolvedValue(undefined)
    mockReadContractsReturn.data = makeSelectData(true)

    renderHook(() => useNftWhitelist(testConfig))

    await vi.waitFor(() => {
      expect(mockGetEnsDomainName).toHaveBeenCalledWith('0xMinter1')
      expect(mockGetEnsDomainName).toHaveBeenCalledWith('0xMinter2')
      expect(mockGetEnsDomainName).toHaveBeenCalledWith('0xGuard1')
    })
  })
})
