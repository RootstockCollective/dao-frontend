import {
  Token,
  TokenRewards,
  useBackerRewardsContext,
  useGetBuildersRewardPercentage,
  RifSvg,
  RbtcSvg,
} from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { useGaugesGetFunction } from '@/app/collective-rewards//shared'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'

const tokenRewardsMetrics = (tokenRewards: TokenRewards, gauge: Address) => {
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
  // TODO: check which gauges are we going to use
  // TODO: check which builders are we going to use
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useBuilderContext()
  const buildersAddress = builders?.map(({ address }) => address)
  const {
    data: buildersRewardsPct,
    isLoading: buildersRewardsPctLoading,
    error: buildersRewardsPctError,
  } = useGetBuildersRewardPercentage(buildersAddress)
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

  const isLoading =
    buildersLoading ||
    buildersRewardsPctLoading ||
    totalAllocationLoading ||
    allocationOfLoading ||
    rewardsLoading
  const error =
    buildersError ?? buildersRewardsPctError ?? totalAllocationError ?? allocationOfError ?? rewardsError

  const { prices } = usePricesContext()
  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const data = builders.map(({ address, builderName, gauge, stateDetails }) => {
    const builderTotalAllocation = totalAllocation[gauge]
    const backerAllocationOf = allocationOf[gauge]
    const totalAllocationPercentage = builderTotalAllocation
      ? (backerAllocationOf * 100n) / builderTotalAllocation
      : 0n
    const rewardPercentage = buildersRewardsPct[address] ?? null

    const rifRewards = tokenRewardsMetrics(tokenRewards[rif.address], gauge)
    const rbtcRewards = tokenRewardsMetrics(tokenRewards[rbtc.address], gauge)

    return {
      address,
      builderName,
      stateDetails,
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
      totalAllocationPercentage,
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
    }
  })

  return {
    data,
    isLoading,
    error,
  }
}
