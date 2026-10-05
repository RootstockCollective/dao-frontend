import { cleanup, renderHook } from '@testing-library/react'
import { zeroAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useGetDelegates } from './useGetDelegates'

const mocks = vi.hoisted(() => ({ delegates: undefined as string | undefined }))

vi.mock('wagmi', () => ({
  useReadContract: () => ({ data: mocks.delegates, isLoading: false, refetch: vi.fn() }),
}))

const ACCOUNT = '0x00000000000000000000000000000000000000Ab'
const DELEGATEE = '0x00000000000000000000000000000000000000cd'

describe('useGetDelegates', () => {
  beforeEach(() => {
    mocks.delegates = undefined
  })

  afterEach(cleanup)

  it('reports no delegatee for an account that has never delegated', () => {
    mocks.delegates = zeroAddress

    const { result } = renderHook(() => useGetDelegates(ACCOUNT))

    expect(result.current.delegateeAddress).toBeUndefined()
    expect(result.current.delegationStatus).toBe('none')
  })

  it('returns the delegatee once the account has delegated to someone else', () => {
    mocks.delegates = DELEGATEE

    const { result } = renderHook(() => useGetDelegates(ACCOUNT))

    expect(result.current.delegateeAddress).toBe(DELEGATEE)
    expect(result.current.delegationStatus).toBe('other')
  })

  it('recognises a self-delegation whatever the address casing', () => {
    mocks.delegates = ACCOUNT.toLowerCase()

    const { result } = renderHook(() => useGetDelegates(ACCOUNT))

    expect(result.current.delegationStatus).toBe('self')
  })

  it('has no status while the delegatee is still loading', () => {
    const { result } = renderHook(() => useGetDelegates(ACCOUNT))

    expect(result.current.delegateeAddress).toBeUndefined()
    expect(result.current.delegationStatus).toBeUndefined()
  })
})
