import {
  Token,
  TokenBackerRewards,
  useBackerRewardsContext,
  useGetBackersRewardPercentage,
  RifSvg,
  RbtcSvg,
  BuilderRewardPercentage,
  TokenRewards,
} from '@/app/collective-rewards/rewards'
import { useGaugesGetFunction } from '@/app/collective-rewards/shared'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { useGetBuildersByState } from '@/app/collective-rewards//user'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useMemo } from 'react'

export type BackerRewards = {
  address: Address
  builderName: string
  stateFlags: BuilderStateFlags
  totalAllocationPercentage: bigint
  rewardPercentage: BuilderRewardPercentage
  estimatedRewards: TokenRewards
  claimableRewards: TokenRewards
  allTimeRewards: TokenRewards
}

const tokenRewardsMetrics = (tokenRewards: TokenBackerRewards, gauge: Address) => {
  const estimatedRewards = Number(formatBalanceToHuman(tokenRewards.estimated[gauge] ?? 0n))
  const earned = Number(formatBalanceToHuman(tokenRewards.earned[gauge] ?? 0n))
  const claimed = Number(
    formatBalanceToHuman(
      tokenRewards.claimed[gauge]?.reduce((acc, value) => acc + value.args.amount_, 0n) ?? 0n,
    ),
  )

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
  } = useGetBuildersByState<Required<Builder>>()
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
                crypto: {
                  value: rifRewards.estimatedRewards,
                  symbol: rif.symbol,
                },
                fiat: {
                  value: rifPrice * rifRewards.estimatedRewards,
                  symbol: currency,
                },
                logo: RifSvg(),
              },
              rbtc: {
                crypto: {
                  value: rbtcRewards.estimatedRewards,
                  symbol: rbtc.symbol,
                },
                fiat: {
                  value: rbtcPrice * rbtcRewards.estimatedRewards,
                  symbol: currency,
                },
                logo: RbtcSvg(),
              },
            },
            claimableRewards: {
              rif: {
                crypto: {
                  value: rifRewards.claimableRewards,
                  symbol: rif.symbol,
                },
                fiat: {
                  value: rifPrice * rifRewards.claimableRewards,
                  symbol: currency,
                },
                logo: RifSvg(),
              },
              rbtc: {
                crypto: {
                  value: rbtcRewards.claimableRewards,
                  symbol: rbtc.symbol,
                },
                fiat: {
                  value: rbtcPrice * rbtcRewards.claimableRewards,
                  symbol: currency,
                },
                logo: RbtcSvg(),
              },
            },
            allTimeRewards: {
              rif: {
                crypto: {
                  value: rifRewards.allTimeRewards,
                  symbol: rif.symbol,
                },
                fiat: {
                  value: rifPrice * rifRewards.allTimeRewards,
                  symbol: currency,
                },
                logo: RifSvg(),
              },
              rbtc: {
                crypto: {
                  value: rbtcRewards.allTimeRewards,
                  symbol: rbtc.symbol,
                },
                fiat: {
                  value: rbtcPrice * rbtcRewards.allTimeRewards,
                  symbol: currency,
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
