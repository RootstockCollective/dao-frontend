import { act, renderHook } from '@testing-library/react'
import { ContextType, ReactNode } from 'react'
import { Address, parseEther } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { useAbiBoostActivation } from './useAbiBoostActivation'

const mockAccount = vi.fn<() => { address: Address | undefined }>()

vi.mock('wagmi', async importOriginal => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useAccount: () => mockAccount(),
}))

type AllocationsValue = ContextType<typeof AllocationsContext>

const BUILDER = '0x1111111111111111111111111111111111111111' as Address
const WALLET_A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address
const WALLET_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address
const k = (thousands: string) => parseEther(`${thousands}000`)

/**
 * `onchain` is the on-chain total, `edited` what the page is about to save on its only Builder.
 * Both allocation maps hold that Builder, so the edit is `edited - onchain` on top of the total.
 */
const contextValue = (onchain: bigint, edited: bigint, isAllocationTxPending = false) =>
  ({
    state: { isAllocationTxPending, allocations: { [BUILDER]: edited } },
    initialState: {
      backer: { amountToAllocate: onchain },
      allocations: { [BUILDER]: onchain },
    },
  }) as unknown as AllocationsValue

const setup = (initial: AllocationsValue) => {
  let value = initial
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AllocationsContext.Provider value={value}>{children}</AllocationsContext.Provider>
  )
  const hook = renderHook(() => useAbiBoostActivation(k('100')), { wrapper })
  const update = (next: AllocationsValue) => {
    value = next
    hook.rerender()
  }
  return { ...hook, update }
}

beforeEach(() => mockAccount.mockReturnValue({ address: WALLET_A }))

describe('useAbiBoostActivation', () => {
  it('fires once the save that crosses the minimum lands on-chain', () => {
    const { result, update } = setup(contextValue(k('50'), k('150')))

    update(contextValue(k('50'), k('150'), true))
    update(contextValue(k('50'), k('150'), false))
    expect(result.current.hasActivated).toBe(false)

    update(contextValue(k('150'), k('150')))
    expect(result.current.hasActivated).toBe(true)

    act(() => result.current.dismiss())
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire on page load, even for a backing above the minimum', () => {
    const { result, update } = setup(contextValue(0n, 0n))
    update(contextValue(k('150'), k('150')))
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire after a rejected save, whatever the total does next', () => {
    const { result, update } = setup(contextValue(k('50'), k('150')))

    // Wallet prompt opened and rejected: the total never moves
    update(contextValue(k('50'), k('150'), true))
    update(contextValue(k('50'), k('150'), false))

    // Later, the total changes for a reason unrelated to that save
    update(contextValue(k('120'), k('120')))
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not let another wallet complete the save', () => {
    const { result, update, rerender } = setup(contextValue(k('50'), k('150')))
    update(contextValue(k('50'), k('150'), true))
    update(contextValue(k('50'), k('150'), false))

    mockAccount.mockReturnValue({ address: WALLET_B })
    rerender()
    update(contextValue(k('150'), k('150')))
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire when the backing was already boosted', () => {
    const { result, update } = setup(contextValue(k('150'), k('200')))
    update(contextValue(k('150'), k('200'), true))
    update(contextValue(k('200'), k('200')))
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire when the save stays under the minimum', () => {
    const { result, update } = setup(contextValue(k('20'), k('60')))
    update(contextValue(k('20'), k('60'), true))
    update(contextValue(k('60'), k('60')))
    expect(result.current.hasActivated).toBe(false)
  })
})
