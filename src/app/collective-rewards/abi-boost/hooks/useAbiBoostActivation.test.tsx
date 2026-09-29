import { act, renderHook } from '@testing-library/react'
import { ContextType, ReactNode } from 'react'
import { parseEther } from 'viem'
import { describe, expect, it } from 'vitest'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { useAbiBoostActivation } from './useAbiBoostActivation'

type AllocationsValue = ContextType<typeof AllocationsContext>

const contextValue = (isAllocationTxPending: boolean, onchainBacking: bigint) =>
  ({
    state: { isAllocationTxPending },
    initialState: { backer: { cumulativeAllocation: onchainBacking }, allocations: {} },
  }) as unknown as AllocationsValue

const setup = (initial: AllocationsValue) => {
  let value = initial
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AllocationsContext.Provider value={value}>{children}</AllocationsContext.Provider>
  )
  const hook = renderHook(() => useAbiBoostActivation(), { wrapper })
  const update = (next: AllocationsValue) => {
    value = next
    hook.rerender()
  }
  return { ...hook, update }
}

describe('useAbiBoostActivation', () => {
  it('fires when a save takes the backing over the minimum', () => {
    const { result, update } = setup(contextValue(false, parseEther('50000')))

    update(contextValue(true, parseEther('50000')))
    update(contextValue(false, parseEther('50000')))
    expect(result.current.hasActivated).toBe(false)

    update(contextValue(false, parseEther('101800')))
    expect(result.current.hasActivated).toBe(true)

    act(() => result.current.dismiss())
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire on page load, even for a backing above the minimum', () => {
    const { result, update } = setup(contextValue(false, 0n))
    update(contextValue(false, parseEther('150000')))
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire when the backing was already boosted', () => {
    const { result, update } = setup(contextValue(false, parseEther('150000')))
    update(contextValue(true, parseEther('150000')))
    update(contextValue(false, parseEther('200000')))
    expect(result.current.hasActivated).toBe(false)
  })

  it('does not fire when the save stays under the minimum', () => {
    const { result, update } = setup(contextValue(false, parseEther('20000')))
    update(contextValue(true, parseEther('20000')))
    update(contextValue(false, parseEther('60000')))
    expect(result.current.hasActivated).toBe(false)
  })
})
