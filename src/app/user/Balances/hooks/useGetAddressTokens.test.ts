import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGetAddressTokens } from './useGetAddressTokens'

const mocks = vi.hoisted(() => ({
  balance: vi.fn(),
  readContracts: vi.fn(),
  query: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useBalance: () => mocks.balance(),
  useReadContracts: () => mocks.readContracts(),
}))
vi.mock('@tanstack/react-query', () => ({ useQuery: () => mocks.query() }))

const loaded = { isLoading: false, error: null, refetch: vi.fn() }
const success = (result: bigint) => ({ status: 'success', result })

const ADDRESS = '0x00000000000000000000000000000000000000ab'

describe('useGetAddressTokens', () => {
  beforeEach(() => {
    mocks.balance.mockReturnValue({ data: { value: 1n }, ...loaded })
    mocks.readContracts.mockReturnValue({
      data: [success(1n), success(2n), success(3n), success(4n)],
      ...loaded,
    })
    mocks.query.mockReturnValue({ data: undefined, isLoading: false, error: null })
  })

  it('reports no error when every read succeeds', () => {
    const { result } = renderHook(() => useGetAddressTokens(ADDRESS, 31))

    expect(result.current.error).toBeNull()
  })

  it('surfaces a single failed read of the multicall, whose balance would otherwise read as 0', () => {
    const error = new Error('balanceOf reverted')
    mocks.readContracts.mockReturnValue({
      data: [success(1n), { status: 'failure', error }, success(3n), success(4n)],
      ...loaded,
    })

    const { result } = renderHook(() => useGetAddressTokens(ADDRESS, 31))

    expect(result.current.error).toBe(error)
  })

  it('prefers the query level error over a single failed read', () => {
    const queryError = new Error('rpc down')
    mocks.readContracts.mockReturnValue({
      data: [{ status: 'failure', error: new Error('balanceOf reverted') }],
      ...loaded,
      error: queryError,
    })

    const { result } = renderHook(() => useGetAddressTokens(ADDRESS, 31))

    expect(result.current.error).toBe(queryError)
  })
})
