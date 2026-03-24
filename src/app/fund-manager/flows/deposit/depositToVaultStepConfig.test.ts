import { describe, expect, it } from 'vitest'

import { RBTC, WRBTC } from '@/lib/constants'

import { getDepositToVaultStepConfig } from './depositToVaultStepConfig'

describe('getDepositToVaultStepConfig', () => {
  it('returns 2 steps for RBTC (no allowance step)', () => {
    const config = getDepositToVaultStepConfig(RBTC)
    expect(config).toHaveLength(2)
  })

  it('returns 3 steps for WRBTC (with allowance step)', () => {
    const config = getDepositToVaultStepConfig(WRBTC)
    expect(config).toHaveLength(3)
  })

  describe('RBTC config', () => {
    const rbtcConfig = getDepositToVaultStepConfig(RBTC)

    it('first step has "Deposit Amount" label', () => {
      expect(rbtcConfig[0].label).toBe('Deposit Amount')
    })

    it('first step has 50% progress', () => {
      expect(rbtcConfig[0].progress).toBe(50)
    })

    it('second step has "Confirm Deposit" label', () => {
      expect(rbtcConfig[1].label).toBe('Confirm Deposit')
    })

    it('second step has 100% progress', () => {
      expect(rbtcConfig[1].progress).toBe(100)
    })

    it('second step has description', () => {
      expect(rbtcConfig[1].description).toBe('Make sure that everything is correct before continuing:')
    })
  })

  describe('WRBTC config', () => {
    const wrbtcConfig = getDepositToVaultStepConfig(WRBTC)

    it('first step has "Deposit Amount" label', () => {
      expect(wrbtcConfig[0].label).toBe('Deposit Amount')
    })

    it('first step has 28% progress', () => {
      expect(wrbtcConfig[0].progress).toBe(28)
    })

    it('second step has "Request Allowance" label', () => {
      expect(wrbtcConfig[1].label).toBe('Request Allowance')
    })

    it('second step has allowance description', () => {
      expect(wrbtcConfig[1].description).toBe(
        'Before you can allocate, you must first approve the allowance in your wallet.',
      )
    })

    it('second step has 68% progress', () => {
      expect(wrbtcConfig[1].progress).toBe(68)
    })

    it('third step has "Confirm Deposit" label', () => {
      expect(wrbtcConfig[2].label).toBe('Confirm Deposit')
    })

    it('third step has 100% progress', () => {
      expect(wrbtcConfig[2].progress).toBe(100)
    })
  })

  it('each step has a component', () => {
    const rbtcConfig = getDepositToVaultStepConfig(RBTC)
    const wrbtcConfig = getDepositToVaultStepConfig(WRBTC)

    rbtcConfig.forEach(step => {
      expect(step.component).toBeDefined()
      expect(typeof step.component).toBe('function')
    })

    wrbtcConfig.forEach(step => {
      expect(step.component).toBeDefined()
      expect(typeof step.component).toBe('function')
    })
  })
})
