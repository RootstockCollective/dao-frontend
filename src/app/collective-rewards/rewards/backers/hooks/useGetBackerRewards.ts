import {
  Token,
  TokenBackerRewards,
  useBackerRewardsContext,
  useGetBackersRewardPercentage,
  RifSvg,
  RbtcSvg,
  TokenRewards,
  BackerRewardPercentage,
} from '@/app/collective-rewards/rewards'
import { useGaugesGetFunction } from '@/app/collective-rewards/shared'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetBuildersByState } from '@/app/collective-rewards//user'
import { BuilderStateFlags, RequiredBuilder } from '@/app/collective-rewards/types'
import { useMemo } from 'react'

export type BackerRewards = {
  address: Address
  builderName: string
  stateFlags: BuilderStateFlags
  totalAllocationPercentage: bigint
  rewardPercentage: BackerRewardPercentage
  estimatedRewards: TokenRewards
  claimableRewards: TokenRewards
  allTimeRewards: TokenRewards
}

const tokenRewardsMetrics = (tokenRewards: TokenBackerRewards, gauge: Address) => {
  const estimatedRewards = tokenRewards.estimated[gauge] ?? 0n
  const earned = tokenRewards.earned[gauge] ?? 0n
  const claimed = tokenRewards.claimed[gauge]?.reduce((acc, value) => acc + value.args.amount_, 0n) ?? 0n

  return {
    claimableRewards: earned,
    estimatedRewards,
    allTimeRewards: earned + claimed,
  }
}

export const useGetBackerRewards = (
  builder: Address,
  gauges: Address[],
  { rif, rbtc }: { [token: string]: Token },
  currency = 'USD',
) => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>()
  const buildersAddress = builders.map(({ address }) => address)
  const {
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useGaugesGetFunction(gauges, 'totalAllocation')
  const {
    data: allocationOf,
    isLoading: allocationOfLoading,
    error: allocationOfError,
  } = useGaugesGetFunction(gauges, 'allocationOf', [builder])
  const { data: tokenRewards, isLoading: rewardsLoading, error: rewardsError } = useBackerRewardsContext()

  const isLoading = useMemo(
    () =>
      buildersLoading ||
      backersRewardsPctLoading ||
      totalAllocationLoading ||
      allocationOfLoading ||
      rewardsLoading,
    [buildersLoading, backersRewardsPctLoading, totalAllocationLoading, allocationOfLoading, rewardsLoading],
  )
  const error = useMemo(
    () =>
      buildersError ?? backersRewardsPctError ?? totalAllocationError ?? allocationOfError ?? rewardsError,
    [buildersError, backersRewardsPctError, totalAllocationError, allocationOfError, rewardsError],
  )

  const { prices } = usePricesContext()
  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const data = useMemo(() => {
    return builders.reduce<BackerRewards[]>((acc, { address, builderName, gauge, stateFlags }) => {
      const builderTotalAllocation = totalAllocation[gauge] ?? 0n
      const backerAllocationOf = allocationOf[gauge] ?? 0n
      const totalAllocationPercentage = builderTotalAllocation
        ? (backerAllocationOf * 100n) / builderTotalAllocation
        : 0n
      const rewardPercentage = backersRewardsPct[address] ?? null

      const rifRewards = tokenRewardsMetrics(tokenRewards[rif.address], gauge)
      const rbtcRewards = tokenRewardsMetrics(tokenRewards[rbtc.address], gauge)

      // If backer allocated for the builder or if they have rewards (estimated or claimable)
      if (
        backerAllocationOf > 0n ||
        rifRewards.estimatedRewards > 0 ||
        rbtcRewards.estimatedRewards > 0 ||
        rifRewards.claimableRewards > 0 ||
        rbtcRewards.claimableRewards > 0
      ) {
        return [
          ...acc,
          {
            address,
            builderName,
            stateFlags,
            totalAllocationPercentage,
            rewardPercentage,
            estimatedRewards: {
              rif: {
                amount: {
                  value: rifRewards.estimatedRewards,
                  symbol: rif.symbol,
                  price: rifPrice,
                  currency,
                },
                logo: RifSvg(),
              },
              rbtc: {
                amount: {
                  value: rbtcRewards.estimatedRewards,
                  symbol: rbtc.symbol,
                  price: rbtcPrice,
                  currency,
                },
                logo: RbtcSvg(),
              },
            },
            claimableRewards: {
              rif: {
                amount: {
                  value: rifRewards.claimableRewards,
                  symbol: rif.symbol,
                  price: rifPrice,
                  currency,
                },
                logo: RifSvg(),
              },
              rbtc: {
                amount: {
                  value: rbtcRewards.claimableRewards,
                  symbol: rbtc.symbol,
                  price: rbtcPrice,
                  currency,
                },
                logo: RbtcSvg(),
              },
            },
            allTimeRewards: {
              rif: {
                amount: {
                  value: rifRewards.allTimeRewards,
                  symbol: rif.symbol,
                  price: rifPrice,
                  currency,
                },
                logo: RifSvg(),
              },
              rbtc: {
                amount: {
                  value: rbtcRewards.allTimeRewards,
                  symbol: rbtc.symbol,
                  price: rbtcPrice,
                  currency,
                },
                logo: RbtcSvg(),
              },
            },
          },
        ]
      }
      return acc
    }, [])
  }, [
    builders,
    totalAllocation,
    allocationOf,
    backersRewardsPct,
    tokenRewards,
    rif,
    rbtc,
    rifPrice,
    rbtcPrice,
    currency,
  ])

  return {
    data,
    isLoading,
    error,
  }
}
