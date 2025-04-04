import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useGetEstimatedBackersRewardsPct } from './useGetEstimatedBackersRewardsPct'

vi.mock('@/app/collective-rewards/user', () => ({
  useGetBuildersByState: () => ({
    data: [
      {
        address: 'builder1',
        gauge: 'gauge1',
        stateFlags: { rewardable: true },
      },
    ],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/app/collective-rewards/rewards', () => ({
  // Deliberately return a number instead of BigInt to simulate the issue
  useGetTotalPotentialReward: () => ({
    data: 100,
    isLoading: false,
    error: null,
  }),
  useGetBackersRewardPercentage: () => ({
    data: {
      builder1: { current: 50n },
    },
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/app/collective-rewards/shared', () => ({
  useGaugesGetFunction: () => ({
    data: { gauge1: 200n },
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/app/collective-rewards/utils', () => ({
  isBuilderRewardable: (stateFlags: any) => stateFlags.rewardable,
}))

describe('useGetEstimatedBackersRewardsPct', () => {
  it('computes estimatedBackerRewardsPct without type error when mixing types', () => {
    // This will throw a TypeError if the hook fails to convert totalPotentialRewards to BigInt
    expect(() => renderHook(() => useGetEstimatedBackersRewardsPct())).not.toThrow(TypeError)
  })
})
