import { renderHook } from '@testing-library/react'
import { ContextType, ReactNode } from 'react'
import { Address, parseEther } from 'viem'
import { describe, expect, it, vi } from 'vitest'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { useBackingBoostChange, useIsBackingBoosted } from './useBackingBoostChange'

const mockIsEnabled = vi.fn(() => true)

vi.mock('./useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => mockIsEnabled(),
}))

const LISTED = '0x1111111111111111111111111111111111111111' as Address
const k = (thousands: string) => parseEther(`${thousands}000`)

const wrap = (onchainTotal: bigint, listedOnchain: bigint, listedEdited: bigint) => {
  const value = {
    state: { allocations: { [LISTED]: listedEdited }, backer: { cumulativeAllocation: listedEdited } },
    initialState: {
      backer: { amountToAllocate: onchainTotal, cumulativeAllocation: listedOnchain },
      allocations: { [LISTED]: listedOnchain },
    },
  } as unknown as ContextType<typeof AllocationsContext>
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AllocationsContext.Provider value={value}>{children}</AllocationsContext.Provider>
  )
  return wrapper
}

const render = (onchainTotal: bigint, listedOnchain: bigint, listedEdited: bigint) =>
  renderHook(() => useBackingBoostChange(), { wrapper: wrap(onchainTotal, listedOnchain, listedEdited) })
    .result.current

const isBoosted = (onchainTotal: bigint, listedOnchain: bigint, listedEdited: bigint) =>
  renderHook(() => useIsBackingBoosted(), { wrapper: wrap(onchainTotal, listedOnchain, listedEdited) }).result
    .current

describe('useBackingBoostChange', () => {
  it('measures the same on-chain total as the header, backing on unlisted Builders included', () => {
    // 60k sit on a Builder the page doesn't list, 50k on a listed one
    expect(render(k('110'), k('50'), k('50'))).toEqual({ current: k('110'), next: k('110') })
  })

  it('applies the edits as a change on top of that total', () => {
    expect(render(k('110'), k('50'), k('20'))).toEqual({ current: k('110'), next: k('80') })
    expect(render(k('110'), k('50'), k('90'))).toEqual({ current: k('110'), next: k('150') })
  })
})

describe('useIsBackingBoosted', () => {
  it('is on once the saved backing reaches the minimum', () => {
    expect(isBoosted(k('150'), k('150'), k('150'))).toBe(true)
  })

  it('ignores an unsaved edit that takes the backing over the minimum', () => {
    expect(isBoosted(k('50'), k('50'), parseEther('101800'))).toBe(false)
  })

  it('stays on while an unsaved edit drops the backing under the minimum', () => {
    expect(isBoosted(k('150'), k('150'), k('90'))).toBe(true)
  })

  it('is off under the minimum', () => {
    expect(isBoosted(k('50'), k('50'), k('50'))).toBe(false)
  })

  it('is off while the flag is off', () => {
    mockIsEnabled.mockReturnValueOnce(false)
    expect(isBoosted(k('150'), k('150'), k('150'))).toBe(false)
  })
})
