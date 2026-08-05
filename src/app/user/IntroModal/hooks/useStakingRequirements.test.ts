import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RBTC, RIF, STRIF } from '@/lib/constants'

import { useStakingRequirements } from './useStakingRequirements'

const mockUseAccount = vi.fn()
const mockUseBalancesContext = vi.fn()
const mockUseMinGasForStaking = vi.fn()

vi.mock('wagmi', () => ({ useAccount: () => mockUseAccount() }))
vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => mockUseBalancesContext(),
}))
vi.mock('./useMinGasForStaking', () => ({ useMinGasForStaking: () => mockUseMinGasForStaking() }))

const MIN_GAS = '0.0002'

/** Balances arrive from the context already converted to human units, not wei. */
const balances = ({ rif = '0', strif = '0', rbtc = '0' }) => ({
  [RIF]: { balance: rif, symbol: RIF, formattedBalance: rif },
  [STRIF]: { balance: strif, symbol: STRIF, formattedBalance: strif },
  [RBTC]: { balance: rbtc, symbol: RBTC, formattedBalance: rbtc },
})

const setup = (opts: {
  rif?: string
  strif?: string
  rbtc?: string
  isConnected?: boolean
  isBalancesLoading?: boolean
  isMinGasLoading?: boolean
}) => {
  mockUseAccount.mockReturnValue({ isConnected: opts.isConnected ?? true })
  mockUseBalancesContext.mockReturnValue({
    balances: balances(opts),
    isBalancesLoading: opts.isBalancesLoading ?? false,
  })
  mockUseMinGasForStaking.mockReturnValue({
    minGas: MIN_GAS,
    isLoading: opts.isMinGasLoading ?? false,
  })

  return renderHook(() => useStakingRequirements()).result
}

describe('useStakingRequirements', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('needsRif', () => {
    it('is true when the user holds neither RIF nor stRIF', () => {
      expect(setup({}).current.needsRif).toBe(true)
    })

    it('is false when the user holds RIF', () => {
      expect(setup({ rif: '100' }).current.needsRif).toBe(false)
    })

    // Someone already staked has nothing to acquire, even with an empty RIF balance.
    it('is false when the user holds only stRIF', () => {
      expect(setup({ strif: '100' }).current.needsRif).toBe(false)
    })
  })

  describe('needsGas', () => {
    it('is true with no rBTC at all', () => {
      expect(setup({}).current.needsGas).toBe(true)
    })

    // The whole point of the threshold: dust is not enough to approve and stake, and telling
    // someone it is strands them mid-flow.
    it('is true for dust below the threshold', () => {
      expect(setup({ rbtc: '0.00006' }).current.needsGas).toBe(true)
    })

    it('is false once the balance clears the threshold', () => {
      expect(setup({ rbtc: '0.004' }).current.needsGas).toBe(false)
    })

    it('is false at exactly the threshold', () => {
      expect(setup({ rbtc: MIN_GAS }).current.needsGas).toBe(false)
    })
  })

  describe('needsStRif', () => {
    it('is true for a user who has never staked, even holding RIF and gas', () => {
      const result = setup({ rif: '100', rbtc: '0.004' })

      expect(result.current.needsStRif).toBe(true)
      expect(result.current.needsRif).toBe(false)
      expect(result.current.needsGas).toBe(false)
    })

    it('is false once the user holds stRIF', () => {
      expect(setup({ strif: '50' }).current.needsStRif).toBe(false)
    })
  })

  describe('isReady', () => {
    it('is true once the wallet, balances and gas threshold have all settled', () => {
      expect(setup({}).current.isReady).toBe(true)
    })

    it('is false while no wallet is connected', () => {
      expect(setup({ isConnected: false }).current.isReady).toBe(false)
    })

    it('is false while balances are loading', () => {
      expect(setup({ isBalancesLoading: true }).current.isReady).toBe(false)
    })

    // Callers freeze a step list on mount, so a threshold that has not resolved would freeze
    // the wrong list.
    it('is false while the gas threshold is loading', () => {
      expect(setup({ isMinGasLoading: true }).current.isReady).toBe(false)
    })
  })

  it('reports the same threshold it gated on, so copy and gate cannot disagree', () => {
    expect(setup({}).current.minGas).toBe(MIN_GAS)
  })
})
