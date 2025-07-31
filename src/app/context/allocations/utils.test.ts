import { describe, expect, it } from 'vitest'
import { Allocations, Backer } from './AllocationsContext'
import { getVoteAllocations, validateAllocationsState, ValidateAllocationsStateParams } from './utils'
import { Address } from 'viem'
import { Builder } from '../../types'

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

  describe('getVoteAllocations', () => {
    const builders = {
      '0x1': {
        gauge: '0x11',
      },
      '0x2': {
        gauge: '0x21',
      },
      '0x3': {
        gauge: '0x31',
      },
    } as unknown as Record<Address, Builder>

    const getBuilder = (address: Address) => builders[address]

    it('should return the modified builders', () => {
      const [gauges, allocs] = getVoteAllocations({
        initialAllocations: {
          '0x1': 3n,
        },
        currentAllocations: {
          '0x1': 5n,
          '0x2': 5n,
        },
        getBuilder,
      })

      expect(gauges).toEqual(['0x11', '0x21'])
      expect(allocs).toEqual([5n, 5n])
    })

    it('should return the modified builders if the initial allocation changed', () => {
      const [gauges, allocs] = getVoteAllocations({
        initialAllocations: {
          '0x1': 3n,
          '0x2': 5n,
        },
        currentAllocations: {
          '0x1': 5n,
          '0x2': 5n,
        },
        getBuilder,
      })

      expect(gauges).toEqual(['0x11'])
      expect(allocs).toEqual([5n])
    })

    it('should return the empty if there are no modified builders', () => {
      const [gauges, allocs] = getVoteAllocations({
        initialAllocations: {
          '0x2': 5n,
        },
        currentAllocations: {
          '0x2': 5n,
        },
        getBuilder,
      })

      expect(gauges).toEqual([])
      expect(allocs).toEqual([])
    })

    it('should return the empty if builder does not exist', () => {
      const [gauges, allocs] = getVoteAllocations({
        initialAllocations: {
          '0x4': 5n,
        },
        currentAllocations: {
          '0x4': 4n,
        },
        getBuilder,
      })

      expect(gauges).toEqual([])
      expect(allocs).toEqual([])
    })
  })
})
