import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetEstimatedBackersRewardsPct } from './useGetEstimatedBackersRewardsPct'

type SetupMocksProps = {
  totalPotentialReward: bigint | undefined
  backersRewardPercentage: Record<string, { current: bigint }> | undefined
  gaugesData: Record<string, bigint> | undefined
  userData:
    | Array<{
        address: string
        gauge: string
        stateFlags: {
          rewardable: boolean
        }
      }>
    | undefined
}

const queryClient = new QueryClient()
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

/**
 * Sets up mocks for various modules.
 * @param totalPotentialReward - The total potential reward to be returned by the mock.
 * @param backersRewardPercentage - The backers reward percentage to be returned by the mock.
 * @param gaugesData - The gauges data to be returned by the mock.
 * @param userData - The user data to be returned by the mock.
 */
const setupMocks = ({
  totalPotentialReward,
  backersRewardPercentage,
  gaugesData,
  userData,
}: SetupMocksProps) => {
  vi.doMock('@/app/collective-rewards/user', () => ({
    useGetBuildersByState: () => ({
      data: userData,
      isLoading: false,
      error: null,
    }),
  }))

  vi.doMock('@/app/collective-rewards/rewards', () => ({
    useGetTotalPotentialReward: () => ({
      data: totalPotentialReward,
      isLoading: false,
      error: null,
    }),
    useGetBackersRewardPercentage: () => ({
      data: backersRewardPercentage,
      isLoading: false,
      error: null,
    }),
  }))

  vi.doMock('@/app/collective-rewards/shared', () => ({
    useGaugesGetFunction: () => ({
      data: gaugesData,
      isLoading: false,
      error: null,
    }),
  }))

  vi.doMock('@/app/collective-rewards/utils', () => ({
    isBuilderRewardable: () => true,
  }))
}

describe('useGetEstimatedBackersRewardsPct', () => {
  describe('with defined data', () => {
    beforeEach(async () => {
      vi.resetModules()
      setupMocks({
        totalPotentialReward: 100n,
        backersRewardPercentage: { builder1: { current: 50n } },
        gaugesData: { gauge1: 200n },
        userData: [
          {
            address: 'builder1',
            gauge: 'gauge1',
            stateFlags: { rewardable: true },
          },
        ],
      })
    })

    it('computes estimatedBackerRewardsPct without type error when mixing types', async () => {
      expect(() => renderHook(() => useGetEstimatedBackersRewardsPct(), { wrapper })).not.toThrow(TypeError)
    })
  })

  describe('with undefined tempTotalPotentialReward', () => {
    beforeEach(async () => {
      vi.resetModules()
      setupMocks({
        totalPotentialReward: undefined,
        backersRewardPercentage: { builder1: { current: 50n } },
        gaugesData: { gauge1: 200n },
        userData: [
          {
            address: 'builder1',
            gauge: 'gauge1',
            stateFlags: { rewardable: true },
          },
        ],
      })
    })

    it('computes estimatedBackerRewardsPct without type error when data is undefined', async () => {
      expect(() => renderHook(() => useGetEstimatedBackersRewardsPct(), { wrapper })).not.toThrow(TypeError)
    })
  })

  describe('with undefined backersRewardPercentage', () => {
    beforeEach(async () => {
      vi.resetModules()
      setupMocks({
        totalPotentialReward: 100n,
        backersRewardPercentage: undefined,
        gaugesData: { gauge1: 200n },
        userData: [
          {
            address: 'builder1',
            gauge: 'gauge1',
            stateFlags: { rewardable: true },
          },
        ],
      })
    })

    it('computes estimatedBackerRewardsPct without type error when data is undefined', async () => {
      expect(() => renderHook(() => useGetEstimatedBackersRewardsPct(), { wrapper })).not.toThrow(TypeError)
    })
  })

  describe('with undefined gaugesData', () => {
    beforeEach(async () => {
      vi.resetModules()
      setupMocks({
        totalPotentialReward: 100n,
        backersRewardPercentage: { builder1: { current: 50n } },
        gaugesData: undefined,
        userData: [
          {
            address: 'builder1',
            gauge: 'gauge1',
            stateFlags: { rewardable: true },
          },
        ],
      })
    })

    it('computes estimatedBackerRewardsPct without type error when data is undefined', async () => {
      expect(() => renderHook(() => useGetEstimatedBackersRewardsPct(), { wrapper })).not.toThrow(TypeError)
    })
  })

  describe('with undefined userData', () => {
    beforeEach(async () => {
      vi.resetModules()
      setupMocks({
        totalPotentialReward: 100n,
        backersRewardPercentage: { builder1: { current: 50n } },
        gaugesData: { gauge1: 200n },
        userData: undefined,
      })
    })

    it('computes estimatedBackerRewardsPct without type error when data is undefined', async () => {
      expect(() => renderHook(() => useGetEstimatedBackersRewardsPct(), { wrapper })).not.toThrow(TypeError)
    })
  })
})
