import { describe, expect, it } from 'vitest'
import { Allocations, Backer } from './AllocationsContext'
import { validateAllocationsState, ValidateAllocationsStateParams } from './utils'

describe('Allocations context utils', () => {
  describe('validateAllocationsState', () => {
    const backer: Backer = {
      balance: 1000n,
      cumulativeAllocation: 10n,
      amountToAllocate: 10n,
      allocationsCount: 2,
    }
    const initialAllocations: Allocations = {
      '0x1': 3n,
    }
    const currentAllocations: Allocations = {
      '0x1': 5n,
      '0x2': 5n,
    }
    const inputs: ValidateAllocationsStateParams = {
      backer,
      initialAllocations,
      currentAllocations,
      totalOnchainAllocation: 3n,
    }

    it('should return false if cumulative allocation > balance', () => {
      const isValidState = validateAllocationsState({
        ...inputs,
        backer: {
          amountToAllocate: 1n,
          cumulativeAllocation: 10n,
          balance: 5n,
        },
      })

      expect(isValidState).toBe(false)
    })

    it('should return false if amount to allocate > balance', () => {
      const isValidState = validateAllocationsState({
        ...inputs,
        backer: {
          cumulativeAllocation: 1n,
          amountToAllocate: 10n,
          balance: 5n,
        },
      })

      expect(isValidState).toBe(false)
    })

    it('should return true if totalOnchainAllocation and cumulativeAllocation are different', () => {
      const isValidState = validateAllocationsState({
        ...inputs,
        totalOnchainAllocation: 1n,
        backer: {
          ...backer,
          cumulativeAllocation: 2n,
        },
      })

      expect(isValidState).toBe(true)
    })

    it('should return false if initialAllocations and currentAllocations are the same', () => {
      const isValidState = validateAllocationsState({
        ...inputs,
        totalOnchainAllocation: 1n,
        backer: {
          ...backer,
          cumulativeAllocation: 1n,
        },
        initialAllocations,
        currentAllocations: {
          ...initialAllocations,
        },
      })

      expect(isValidState).toBe(false)
    })
  })
})
