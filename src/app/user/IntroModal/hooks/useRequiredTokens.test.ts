import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  NEED_RBTC,
  NEED_RBTC_RIF,
  NEED_RIF,
  NEED_STRIF,
  useRequiredTokens,
} from './useRequiredTokens'

const mockUseStakingRequirements = vi.fn()

vi.mock('./useStakingRequirements', () => ({
  useStakingRequirements: () => mockUseStakingRequirements(),
}))

const setup = (opts: {
  needsRif?: boolean
  needsGas?: boolean
  needsStRif?: boolean
  isReady?: boolean
}) => {
  mockUseStakingRequirements.mockReturnValue({
    needsRif: opts.needsRif ?? false,
    needsGas: opts.needsGas ?? false,
    needsStRif: opts.needsStRif ?? false,
    isReady: opts.isReady ?? true,
  })

  return renderHook(() => useRequiredTokens()).result
}

/**
 * This hook feeds the StackingNotifications banners. It used to derive its own balances; it
 * now reads `useStakingRequirements`, which changed the gas question from "any rBTC at all?"
 * to "enough rBTC to approve and stake?". These lock that in — the banner a user sees is the
 * visible consequence.
 */
describe('useRequiredTokens', () => {
  beforeEach(() => vi.clearAllMocks())

  it('asks for both when the user has neither', () => {
    expect(setup({ needsRif: true, needsGas: true, needsStRif: true }).current).toBe(NEED_RBTC_RIF)
  })

  it('asks for gas alone when only gas is short', () => {
    expect(setup({ needsGas: true, needsStRif: true }).current).toBe(NEED_RBTC)
  })

  it('asks for RIF alone when only RIF is missing', () => {
    expect(setup({ needsRif: true, needsStRif: true }).current).toBe(NEED_RIF)
  })

  it('asks the user to stake once they hold RIF and enough gas', () => {
    expect(setup({ needsStRif: true }).current).toBe(NEED_STRIF)
  })

  it('asks for nothing once the user has staked', () => {
    expect(setup({}).current).toBeNull()
  })

  // The behaviour change worth pinning: dust rBTC used to read as "has gas" and showed no gas
  // banner, stranding the user at the approve step. It now reports NEED_RBTC.
  it('still asks for gas when the balance is non-zero but below the threshold', () => {
    expect(setup({ needsGas: true, needsStRif: true }).current).toBe(NEED_RBTC)
  })

  describe('before the data has settled', () => {
    it('returns null rather than a banner built on unresolved balances', () => {
      expect(setup({ needsRif: true, needsGas: true, isReady: false }).current).toBeNull()
    })
  })
})
