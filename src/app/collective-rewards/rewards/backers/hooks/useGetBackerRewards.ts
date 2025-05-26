import { useGetBuildersByState } from '@/app/collective-rewards//user'
import {
  BackerRewardPercentage,
  RbtcSvg,
  RifSvg,
  Token,
  TokenBackerRewards,
  TokenRewards,
  useBackerRewardsContext,
  useGetBackersRewardPercentage,
} from '@/app/collective-rewards/rewards'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'

export type BackerRewards = RequiredBuilder & {
  totalAllocation: TokenRewards
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
  { rif, rbtc }: { [token: string]: Token },
  currency = 'USD',
) => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>()
  const buildersAddress = builders.map(({ address }) => address)
  const gauges = builders.map(({ gauge }) => gauge)
  const {
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress)
  const {
    data: allocationOf,
    isLoading: allocationOfLoading,
    error: allocationOfError,
  } = useReadGauges({ addresses: gauges, functionName: 'allocationOf', args: [builder] })
  const { data: tokenRewards, isLoading: rewardsLoading, error: rewardsError } = useBackerRewardsContext()

  const isLoading = useMemo(
    () => buildersLoading || backersRewardsPctLoading || allocationOfLoading || rewardsLoading,
    [buildersLoading, backersRewardsPctLoading, allocationOfLoading, rewardsLoading],
  )
  const error = useMemo(
    () => buildersError ?? backersRewardsPctError ?? allocationOfError ?? rewardsError,
    [buildersError, backersRewardsPctError, allocationOfError, rewardsError],
  )

  const { prices } = usePricesContext()
  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const data = useMemo(() => {
    return builders.reduce<BackerRewards[]>((acc, builder, i) => {
      const { address, gauge } = builder
      const backerAllocationOf = allocationOf[i] ?? 0n

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
            ...builder,
            totalAllocation: {
              rif: {
                amount: {
                  value: backerAllocationOf,
                  symbol: rif.symbol,
                  price: rifPrice,
                  currency,
                },
                logo: RifSvg(),
              },
            },
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
  }, [builders, allocationOf, backersRewardsPct, tokenRewards, rif, rbtc, rifPrice, rbtcPrice, currency])

  return {
    data,
    isLoading,
    error,
  }
}
