import { BackerRewardPercentage } from '@/app/collective-rewards/rewards'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

export type EstimatedBackerRewards = RequiredBuilder & {
  estimatedBackerRewardsPct: bigint
  rewardPercentage: BackerRewardPercentage
}

type BuilderData = {
  id: string
  backerRewardPercentage: bigint
  rewardShares: bigint
}

type CycleData = {
  id: string
  totalPotentialReward: bigint
}

type EstimatedBackersRewardsData = {
  cycles: CycleData[]
  builders: BuilderData[]
}

const ESTIMATED_BACKERS_REWARDS_QUERY = gql`
  query EstimatedBackersRewardsPct {
    builders(
      where: { state_: { kycApproved: true, communityApproved: true, initialized: true, selfPaused: false } }
    ) {
      id
      backerRewardPercentage
      rewardShares
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      totalPotentialReward
    }
  }
`

export const useGetEstimatedBackersRewardsPct = () => {
  const { data, ...responseMeta } = useQuery<EstimatedBackersRewardsData>(ESTIMATED_BACKERS_REWARDS_QUERY)

  return {
    data: useMemo(() => {
      if (!data?.cycles[0]?.totalPotentialReward || !data?.builders?.length) return []
      const { totalPotentialReward } = data.cycles[0]

      return data.builders.map(builder => {
        const { id, backerRewardPercentage, rewardShares } = builder

        if (!backerRewardPercentage || !rewardShares || backerRewardPercentage <= 0n || rewardShares <= 0n) {
          return {
            id,
            estimatedBackerRewardsPct: 0n,
            backerRewardPercentage: 0n,
          }
        }

        return {
          id,
          estimatedBackerRewardsPct: (rewardShares * backerRewardPercentage) / totalPotentialReward,
          backerRewardPercentage,
        }
      })
    }, [data]),
    ...responseMeta,
  }
}
