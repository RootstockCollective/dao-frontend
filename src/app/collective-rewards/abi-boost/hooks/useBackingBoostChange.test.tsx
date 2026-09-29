import { renderHook } from '@testing-library/react'
import { ContextType, ReactNode } from 'react'
import { Address, parseEther } from 'viem'
import { describe, expect, it } from 'vitest'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'

import { useBackingBoostChange } from './useBackingBoostChange'

const LISTED = '0x1111111111111111111111111111111111111111' as Address
const k = (thousands: string) => parseEther(`${thousands}000`)

const render = (onchainTotal: bigint, listedOnchain: bigint, listedEdited: bigint) => {
  const value = {
    state: { allocations: { [LISTED]: listedEdited } },
    initialState: { backer: { amountToAllocate: onchainTotal }, allocations: { [LISTED]: listedOnchain } },
  } as unknown as ContextType<typeof AllocationsContext>
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AllocationsContext.Provider value={value}>{children}</AllocationsContext.Provider>
  )
  return renderHook(() => useBackingBoostChange(), { wrapper }).result.current
}

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
