import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { EnvironmentsProvider, useEnvironmentsContext } from '@/shared/context/EnvironmentsContext'
import { ReactNode } from 'react'
import * as contracts from '@/lib/contracts'
import * as constants from '@/lib/constants'
import { zeroAddress } from 'viem'

vi.mock(import('@tanstack/react-query'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

vi.mock('@/lib/contracts', () => ({
  BackersManagerAddress: '0x123',
  BuilderRegistryAddress: '0x456',
  RewardDistributorAddress: '0x789',
}))

vi.mock(import('@/lib/constants'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    CR_MIGRATING: true,
  }
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <EnvironmentsProvider>{children}</EnvironmentsProvider>
)

const renderHookWithProvider = () => renderHook(() => useEnvironmentsContext(), { wrapper })

const mockUseQuery = (data: boolean) => {
  vi.mocked(useQuery).mockReturnValue({
    data,
  } as UseQueryResult)
}

describe('EnvironmentsContext', () => {
  beforeEach(() => {
    mockUseQuery(false)
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  describe('useBuilderRegistryMigration', () => {
    it('should not enable the hook if BuilderRegistryAddress is zero address', async () => {
      vi.spyOn(contracts, 'BuilderRegistryAddress', 'get').mockReturnValue(zeroAddress)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x123')
      expect(useQuery).toBeCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      )
    })

    it('should not enable the hook if CR_MIGRATING is false', async () => {
      vi.spyOn(constants, 'CR_MIGRATING', 'get').mockReturnValue(false)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x123')
      expect(useQuery).toBeCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      )
    })

    it('should return BackersManagerAddress if migration has not occurred', async () => {
      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x123')
      expect(useQuery).toBeCalledWith(
        expect.objectContaining({
          enabled: true,
        }),
      )
    })

    it('should return BuilderRegistryAddress if migration has occurred', async () => {
      mockUseQuery(true)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x456')
      expect(useQuery).toBeCalledWith(
        expect.objectContaining({
          enabled: true,
        }),
      )
    })

    it('should disable the hook after migration has occurred', async () => {
      const { result: priorMigration } = renderHookWithProvider()

      expect(priorMigration.current.builderRegistryAddress).toBe('0x123')
      expect(useQuery).toBeCalledWith(
        expect.objectContaining({
          enabled: true,
        }),
      )

      mockUseQuery(true)

      const { result: afterMigration } = renderHookWithProvider()

      expect(afterMigration.current.builderRegistryAddress).toBe('0x456')
      expect(useQuery).toBeCalledWith(
        expect.objectContaining({
          enabled: false,
        }),
      )
    })
  })
})
