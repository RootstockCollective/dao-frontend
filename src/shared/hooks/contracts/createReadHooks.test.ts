import { renderHook } from '@testing-library/react'
import { Address } from 'viem'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContract } from 'wagmi'

import { BackersManagerAbi } from '@/lib/abis/tok/BackersManagerAbi'
import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { CycleTimeKeeperAbi } from '@/lib/abis/tok/CycleTimeKeeperAbi'
import { RewardDistributorAbi } from '@/lib/abis/tok/RewardDistributorAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress, BuilderRegistryAddress, RewardDistributorAddress } from '@/lib/contracts'

import { useReadBackersManager } from './collective-rewards/useReadBackersManager'
import { useReadBuilderRegistry } from './collective-rewards/useReadBuilderRegistry'
import { useReadCycleTimeKeeper } from './collective-rewards/useReadCycleTimeKeeper'
import { useReadRewardDistributor } from './collective-rewards/useReadRewardDistributor'

vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
  useReadContracts: vi.fn(),
}))

// The unit test env doesn't define the contract address vars, so the real `@/lib/contracts`
// resolves all three of these to `zeroAddress` — a hook wired to the wrong contract would still
// match. Distinct sentinels are what make each binding observable.
vi.mock('@/lib/contracts', () => ({
  BackersManagerAddress: '0x000000000000000000000000000000000000ba61' as Address,
  BuilderRegistryAddress: '0x00000000000000000000000000000000000b8e61' as Address,
  RewardDistributorAddress: '0x000000000000000000000000000000000000d157' as Address,
}))

const mockedUseReadContract = useReadContract as unknown as Mock

/**
 * The four hooks each carry their own generic signature, which a shared table would collapse into
 * a union TypeScript can't call. They are only ever invoked one way here, so narrowing them to a
 * single call shape is enough.
 */
type FixedAddressReadHook = (
  config: { functionName: string },
  query?: { enabled?: boolean },
) => { data?: unknown }

/**
 * Every hook below is produced by `createContractReadHook`, which binds an ABI and an address at
 * module load. Nothing in the type system pins those pairs together — every address is just an
 * `Address` — so this table is the only thing standing between a swapped constant and production.
 */
const FIXED_ADDRESS_HOOKS = [
  {
    name: 'useReadBackersManager',
    hook: useReadBackersManager as unknown as FixedAddressReadHook,
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    functionName: 'totalPotentialReward',
  },
  {
    name: 'useReadBuilderRegistry',
    hook: useReadBuilderRegistry as unknown as FixedAddressReadHook,
    abi: BuilderRegistryAbi,
    address: BuilderRegistryAddress,
    functionName: 'getGaugesLength',
  },
  {
    // Not a typo: the CycleTimeKeeper functions live on the BackersManager deployment.
    name: 'useReadCycleTimeKeeper',
    hook: useReadCycleTimeKeeper as unknown as FixedAddressReadHook,
    abi: CycleTimeKeeperAbi,
    address: BackersManagerAddress,
    functionName: 'distributionDuration',
  },
  {
    name: 'useReadRewardDistributor',
    hook: useReadRewardDistributor as unknown as FixedAddressReadHook,
    abi: RewardDistributorAbi,
    address: RewardDistributorAddress,
    functionName: 'defaultRifAmount',
  },
] as const

describe('createContractReadHook', () => {
  afterEach(() => {
    mockedUseReadContract.mockReset()
  })

  describe.each(FIXED_ADDRESS_HOOKS)('$name', ({ hook, abi, address, functionName }) => {
    it('binds its own ABI and address, and polls once per block', () => {
      mockedUseReadContract.mockReturnValue({ data: 1n, isLoading: false })

      renderHook(() => hook({ functionName }))

      expect(useReadContract).toHaveBeenCalledWith({
        abi,
        address,
        functionName,
        query: {
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
        },
      })
    })

    it('merges caller query overrides over the shared defaults instead of replacing them', () => {
      mockedUseReadContract.mockReturnValue({ data: undefined, isLoading: false })

      renderHook(() => hook({ functionName }, { enabled: false }))

      expect(useReadContract).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            retry: true,
            refetchInterval: AVERAGE_BLOCKTIME,
            enabled: false,
          },
        }),
      )
    })
  })

  it('gives each contract a distinct address, so the assertions above can catch a cross-wiring', () => {
    expect(new Set([BackersManagerAddress, BuilderRegistryAddress, RewardDistributorAddress]).size).toBe(3)
  })
})
