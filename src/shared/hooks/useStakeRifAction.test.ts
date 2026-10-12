import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RIF } from '@/lib/constants'

import { useStakeRifAction } from './useStakeRifAction'

const GET_RIF_LINK = 'https://example.com/get-rif'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  rifBalance: '0',
  isBalancesLoading: false,
  links: { getRif: '' },
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({
    balances: { [RIF]: { balance: mocks.rifBalance } },
    isBalancesLoading: mocks.isBalancesLoading,
  }),
}))
vi.mock('@/lib/links', () => ({ currentLinks: mocks.links }))

describe('useStakeRifAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rifBalance = '0'
    mocks.isBalancesLoading = false
    mocks.links.getRif = GET_RIF_LINK
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('sends a RIF holder to stake', () => {
    mocks.rifBalance = '12.5'

    const { action } = renderHook(() => useStakeRifAction()).result.current
    act(() => action?.onClick())

    expect(action?.text).toBe('Stake RIF')
    expect(mocks.push).toHaveBeenCalledWith('/user?action=stake')
  })

  it('points someone without RIF to where to get it, in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)

    const { action } = renderHook(() => useStakeRifAction()).result.current
    act(() => action?.onClick())

    expect(action?.text).toBe('Get RIF')
    expect(open).toHaveBeenCalledWith(GET_RIF_LINK, '_blank', 'noopener,noreferrer')
  })

  it('offers nothing when there is no RIF and nowhere to get it', () => {
    mocks.links.getRif = ''

    expect(renderHook(() => useStakeRifAction()).result.current.action).toBeUndefined()
  })

  it('reports while the RIF balance is still loading', () => {
    mocks.isBalancesLoading = true

    expect(renderHook(() => useStakeRifAction()).result.current.isLoading).toBe(true)
  })
})
