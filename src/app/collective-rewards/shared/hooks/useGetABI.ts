import { useGetBackersRewardPercentage } from '@/app/collective-rewards/rewards'
import { useGetCyclePayout } from '@/app/collective-rewards/shared'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauges } from '@/shared/hooks/contracts'
import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { Address } from 'viem'

const useGetAbi = (rewardsPerStRif: Big): Big => {
  const { prices } = usePricesContext()
  const rifPrice = prices.RIF?.price ?? 0

  if (!rifPrice) {
    return Big(0)
  }

  return Big(1).add(Big(rewardsPerStRif).div(WeiPerEther.toString()).div(rifPrice)).pow(26).minus(1).mul(100)
}

type CycleData = {
  id: string
  totalPotentialReward: string
  rewardsERC20: string
  rewardsRBTC: string
}

type BuilderData = {
  id: Address
  backerRewardPercentage: string
  rewardShares: string
  totalAllocation: string
}

type BackerData = {
  id: Address
  totalAllocation: string
}

type BackerBuilderData = {
  id: Address
  totalAllocation: string
  builder: BuilderData
  backer: BackerData
}

type ABIDataQuery = {
  cycles: CycleData[]
  backerToBuilders: BackerBuilderData[]
}

const ABI_DATA_QUERY = gql`
  query AbiData($backer: Bytes) {
    backerToBuilders(
      where: {
        and: [
          { backer: "0xA18F4FBEE88592beE3d51D90Ba791e769A9b902f" }
          {
            builderState_: {
              kycApproved: true
              communityApproved: true
              initialized: true
              selfPaused: false
            }
          }
        ]
      }
    ) {
      id
      totalAllocation
      builder {
        id
        backerRewardPercentage
        rewardShares
        totalAllocation
      }
      backer {
        id
        totalAllocation
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      totalPotentialReward
      rewardsERC20
      rewardsRBTC
    }
  }
`

export const useGetRewardsAbi = (backer: Address) => {
  const { prices } = usePricesContext()

  // TODO: make use of useSuspenseQuery
  const { data: abiData, error: abiDataError, ...abiDataMeta } = useQuery<ABIDataQuery>(ABI_DATA_QUERY)

  if (
    !abiData?.backerToBuilders ||
    !abiData?.cycles?.length ||
    abiDataError ||
    !prices?.RIF?.price ||
    !prices?.RBTC?.price
  ) {
    return {
      data: 0,
      isLoading: false,
      error: abiDataError,
    }
  }
  const { backerToBuilders: rewardableBuilderPerBacker, cycles } = abiData
  console.warn('😈 ~ useGetABI.ts ~ useGetRewardsAbi ~ abiData:', abiData)
  const {
    RIF: { price: rifPrice },
    RBTC: { price: rbtcPrice },
  } = prices
  const { rewardsERC20, rewardsRBTC, totalPotentialReward } = cycles[0]

  const rewardsPerStRif = useMemo(() => {
    if (!rewardableBuilderPerBacker[0]?.backer?.totalAllocation) {
      return Big(0)
    }
    /**
     * \frac{\sum{b.length|i}(\frac{b\index{i}.backerAllocation * \frac{\frac{b\index{i}.rewardShares * b\index{i}.backerRewardPerc * (c.rewardRif * rifPrice + c.rewardRbtc * rbtcPrice) |c.totalPotentialReward * 10\power{18}}|10\power{18}}|b\index{i}.totalAllocation})* 10\power{18}|backerTotalAllocation}
     *
     * simplifies to:
     *
     * \frac{\sum{b.length|i}(\frac{b\index{i}.backerAllocation * b\index{i}.rewardShares * b\index{i}.backerRewardPerc|b\index{i}.totalAllocation}) * 10\power{18} * (c.rewardRif * rifPrice + c.rewardRbtc * rbtcPrice)|c.totalPotentialReward * backerTotalAllocation}
     */
    const backerRewardPerRewardableBuilder = rewardableBuilderPerBacker.reduce<Big>(
      (
        acc,
        {
          builder: {
            backerRewardPercentage,
            rewardShares: rewardShares,
            totalAllocation: builderTotalAllocation,
          },
          totalAllocation: backerAllocation,
        },
      ) =>
        Big(backerAllocation)
          .mul(rewardShares)
          .mul(backerRewardPercentage)
          .div(builderTotalAllocation)
          .plus(acc),
      Big(0),
    )

    return backerRewardPerRewardableBuilder
      .mul(WeiPerEther.toString())
      .mul(Big(rewardsERC20).mul(rifPrice).plus(Big(rewardsRBTC).mul(rbtcPrice)))
      .div(Big(totalPotentialReward).mul(rewardableBuilderPerBacker[0].backer.totalAllocation))
  }, [rewardableBuilderPerBacker, totalPotentialReward, rewardsERC20, rewardsRBTC, rifPrice, rbtcPrice])

  const abi = useGetAbi(Big(rewardsPerStRif.toString()))

  return {
    data: abi,
    error: abiDataError,
    ...abiDataMeta,
  }
}

export const useGetMetricsAbi = () => {
  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useGetBuildersByState<RequiredBuilder>({
    activated: true,
    communityApproved: true,
    kycApproved: true,
    revoked: false,
  })

  const gauges = builders.map(({ gauge }) => gauge)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })

  const buildersAddress = builders.map(({ address }) => address)
  const {
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress)
  const { cyclePayout, loading: cyclePayoutLoading, error: cyclePayoutError } = useGetCyclePayout()

  const rewardsPerStRif = useMemo(() => {
    const sumTotalAllocation = Object.values(totalAllocation).reduce<bigint>(
      (acc, value) => acc + (value ?? 0n),
      0n,
    )

    if (!sumTotalAllocation) {
      return 0n
    }

    const topFiveBuilders = builders
      .reduce<Array<{ allocation: bigint; current: bigint }>>((acc, builder, i) => {
        const allocation = totalAllocation[i] ?? 0n
        const rewardPct = backersRewardsPct[builder.address]
        if (allocation && rewardPct) {
          acc.push({ allocation, current: rewardPct.current })
        }
        return acc
      }, [])
      .sort((a, b) => (a.allocation > b.allocation ? -1 : 1))
      .slice(0, 5)

    // We use the multiplication with the current backer rewards % to avoid losing precision
    // Thats why we don't need to multiply by 100
    const weightedAverageBuilderRewardsPct = topFiveBuilders.reduce(
      (acc, { allocation, current }) => acc + (allocation * current) / sumTotalAllocation,
      0n,
    )

    return (cyclePayout * weightedAverageBuilderRewardsPct) / sumTotalAllocation
  }, [backersRewardsPct, builders, cyclePayout, totalAllocation])

  const isLoading =
    buildersLoading || cyclePayoutLoading || totalAllocationLoading || backersRewardsPctLoading

  const error = buildersError ?? cyclePayoutError ?? totalAllocationError ?? backersRewardsPctError

  const abi = useGetAbi(Big(rewardsPerStRif.toString()))

  return {
    data: abi,
    isLoading,
    error,
  }
}
