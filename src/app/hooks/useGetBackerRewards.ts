import { TokenBackerRewards, useBackerRewardsContext, useBuilderContext } from '@/app/context'
import { BackerRewardPercentage, CompleteBuilder, Token, TokenRewards } from '@/app/types'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { Address } from 'viem'
import { filterBuildersByState } from '@/app/utils'

export type BackerRewards = CompleteBuilder & {
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
  backer: Address,
  { rif, rbtc }: { [token: string]: Token },
  currency = 'USD',
) => {
  const { builders, isLoading: buildersLoading, error: buildersError } = useBuilderContext()
  const { activeBuilders, gauges } = useMemo(() => {
    const filteredBuilders = filterBuildersByState<CompleteBuilder>(builders)
    const builderGauges = filteredBuilders.map(({ gauge }) => gauge)
    return { activeBuilders: filteredBuilders, gauges: builderGauges }
  }, [builders])
  const {
    data: allocationOf,
    isLoading: allocationOfLoading,
    error: allocationOfError,
  } = useReadGauges({ addresses: gauges, functionName: 'allocationOf', args: [backer] })
  const { data: tokenRewards, isLoading: rewardsLoading, error: rewardsError } = useBackerRewardsContext()

  const isLoading = buildersLoading || allocationOfLoading || rewardsLoading
  const error = buildersError ?? allocationOfError ?? rewardsError

  const { prices } = usePricesContext()
  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const data = useMemo(() => {
    return activeBuilders.reduce<BackerRewards[]>((acc, builder, i) => {
      const { gauge, backerRewardPct } = builder
      const backerAllocationOf = allocationOf[i] ?? 0n

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
              },
            },
            rewardPercentage: backerRewardPct,
            estimatedRewards: {
              rif: {
                amount: {
                  value: rifRewards.estimatedRewards,
                  symbol: rif.symbol,
                  price: rifPrice,
                  currency,
                },
              },
              rbtc: {
                amount: {
                  value: rbtcRewards.estimatedRewards,
                  symbol: rbtc.symbol,
                  price: rbtcPrice,
                  currency,
                },
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
              },
              rbtc: {
                amount: {
                  value: rbtcRewards.claimableRewards,
                  symbol: rbtc.symbol,
                  price: rbtcPrice,
                  currency,
                },
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
              },
              rbtc: {
                amount: {
                  value: rbtcRewards.allTimeRewards,
                  symbol: rbtc.symbol,
                  price: rbtcPrice,
                  currency,
                },
              },
            },
          },
        ]
      }
      return acc
    }, [])
  }, [activeBuilders, allocationOf, tokenRewards, rif, rbtc, rifPrice, rbtcPrice, currency])

  return {
    data,
    isLoading,
    error,
  }
}
