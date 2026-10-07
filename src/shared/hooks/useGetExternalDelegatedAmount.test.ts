import { cleanup, renderHook } from '@testing-library/react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useGetExternalDelegatedAmount } from './useGetExternalDelegatedAmount'

const ACCOUNT = '0x00000000000000000000000000000000000000Ab'
const DELEGATEE = '0x00000000000000000000000000000000000000cd'

const mocks = vi.hoisted(() => ({
  delegates: {
    delegateeAddress: undefined as string | undefined,
    delegationStatus: undefined as string | undefined,
  },
  reads: {} as Record<string, bigint | undefined>,
}))

vi.mock('wagmi', () => ({
  useReadContract: (config?: { functionName: string; args: [string] }) => ({
    data: config && mocks.reads[`${config.functionName}:${config.args[0]}`],
    isLoading: false,
    refetch: vi.fn(),
  }),
}))
vi.mock('@/app/user/Delegation/hooks/useGetDelegates', () => ({
  useGetDelegates: () => ({ ...mocks.delegates, isLoading: false, refetch: vi.fn() }),
}))
vi.mock('@/lib/rns', () => ({ getEnsDomainName: () => Promise.resolve(undefined) }))

const BALANCE = parseEther('20')
const RECEIVED = parseEther('5')

describe('useGetExternalDelegatedAmount', () => {
  beforeEach(() => {
    mocks.reads = { [`balanceOf:${ACCOUNT}`]: BALANCE }
  })

  afterEach(cleanup)

  it('counts nothing as delegated, and only received votes as available, when the account never delegated', () => {
    mocks.delegates = { delegateeAddress: undefined, delegationStatus: 'none' }
    mocks.reads[`getVotes:${ACCOUNT}`] = RECEIVED

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current).toMatchObject({
      delegationStatus: 'none',
      own: BALANCE,
      delegated: 0n,
      amount: RECEIVED,
      available: RECEIVED,
    })
  })

  it('counts the whole balance as delegated when it went to someone else', () => {
    mocks.delegates = { delegateeAddress: DELEGATEE, delegationStatus: 'other' }
    mocks.reads[`getVotes:${ACCOUNT}`] = RECEIVED

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current).toMatchObject({ delegated: BALANCE, amount: RECEIVED, available: RECEIVED })
  })

  it('makes the balance plus what was received available when delegated to myself', () => {
    mocks.delegates = { delegateeAddress: ACCOUNT, delegationStatus: 'self' }
    mocks.reads[`getVotes:${ACCOUNT}`] = BALANCE + RECEIVED

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current).toMatchObject({
      delegationStatus: 'self',
      delegated: 0n,
      amount: RECEIVED,
      available: BALANCE + RECEIVED,
    })
  })

  it('counts the votes of a self-delegated account that unstaked everything as received', () => {
    mocks.delegates = { delegateeAddress: ACCOUNT, delegationStatus: 'self' }
    mocks.reads[`balanceOf:${ACCOUNT}`] = 0n
    mocks.reads[`getVotes:${ACCOUNT}`] = RECEIVED

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current).toMatchObject({ own: 0n, amount: RECEIVED, available: RECEIVED })
  })

  it('reads the balance and votes of the address it is given', () => {
    const OTHER_ACCOUNT = '0x00000000000000000000000000000000000000Ef'
    mocks.delegates = { delegateeAddress: OTHER_ACCOUNT, delegationStatus: 'self' }
    mocks.reads = { [`balanceOf:${OTHER_ACCOUNT}`]: BALANCE, [`getVotes:${OTHER_ACCOUNT}`]: BALANCE }

    const { result } = renderHook(() => useGetExternalDelegatedAmount(OTHER_ACCOUNT))

    expect(result.current).toMatchObject({ own: BALANCE, available: BALANCE, isAccountRead: true })
  })

  it.each(['getVotes', 'balanceOf'])('is not read while %s has no value', functionName => {
    mocks.delegates = { delegateeAddress: undefined, delegationStatus: 'none' }
    mocks.reads[`getVotes:${ACCOUNT}`] = RECEIVED
    delete mocks.reads[`${functionName}:${ACCOUNT}`]

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current.isAccountRead).toBe(false)
  })

  it('falls back to the own stRIF of a self-delegated account when its votes cannot be read', () => {
    mocks.delegates = { delegateeAddress: ACCOUNT, delegationStatus: 'self' }

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current.available).toBe(BALANCE)
  })

  it('makes nothing available when the votes of an account delegated elsewhere cannot be read', () => {
    mocks.delegates = { delegateeAddress: DELEGATEE, delegationStatus: 'other' }

    const { result } = renderHook(() => useGetExternalDelegatedAmount(ACCOUNT))

    expect(result.current.available).toBe(0n)
  })
})
