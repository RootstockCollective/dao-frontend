import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { EnvironmentsProvider, useEnvironmentsContext } from '@/shared/context/EnvironmentsContext'
import { ReactNode } from 'react'
import * as contracts from '@/lib/contracts'
import * as constants from '@/lib/constants'
import { zeroAddress } from 'viem'
import { useReadContract, UseReadContractReturnType } from 'wagmi'

vi.mock(import('wagmi'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useReadContract: vi.fn(),
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

const mockUseQuery = (data: bigint | undefined) => {
  vi.mocked(useReadContract).mockReturnValue({
    data,
  } as UseReadContractReturnType)
}

describe('EnvironmentsContext', () => {
  beforeEach(() => {
    mockUseQuery(undefined)
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  describe('useBuilderRegistryMigration', () => {
    it('should not enable the hook if BuilderRegistryAddress is zero address', () => {
      vi.spyOn(contracts, 'BuilderRegistryAddress', 'get').mockReturnValue(zeroAddress)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x123')
      expect(useReadContract).toBeCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: false,
          }),
        }),
      )
    })

    it('should not enable the hook if CR_MIGRATING is false', () => {
      vi.spyOn(constants, 'CR_MIGRATING', 'get').mockReturnValue(false)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x123')
      expect(useReadContract).toBeCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: false,
          }),
        }),
      )
    })

    it('should return BackersManagerAddress if migration has not occurred', () => {
      mockUseQuery(0n)
      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x123')
      expect(useReadContract).toBeCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: true,
          }),
        }),
      )
    })

    it('should return BuilderRegistryAddress if migration has occurred', () => {
      mockUseQuery(1n)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBe('0x456')
      expect(useReadContract).toBeCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: true,
          }),
        }),
      )
    })

    it('should disable the hook after migration has occurred', () => {
      mockUseQuery(0n)
      const { result: priorMigration } = renderHookWithProvider()

      expect(priorMigration.current.builderRegistryAddress).toBe('0x123')
      expect(useReadContract).toBeCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: true,
          }),
        }),
      )

      mockUseQuery(1n)

      const { result: afterMigration } = renderHookWithProvider()

      expect(afterMigration.current.builderRegistryAddress).toBe('0x456')
      expect(useReadContract).toBeCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: false,
          }),
        }),
      )
    })

    it('should return undefined if first query has not occurred', () => {
      mockUseQuery(undefined)

      const { result } = renderHookWithProvider()

      expect(result.current.builderRegistryAddress).toBeUndefined()
    })
  })
})
