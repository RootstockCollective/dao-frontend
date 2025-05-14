import { useIntervalTimestamp } from '@/app/collective-rewards/metrics/hooks/useIntervalTimestamp'
import { Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { Address } from 'viem'

const useGetTokenRewards = ({ address, symbol }: Token) => {
  const { prices } = usePricesContext()
  const { data, isLoading, error } = useBackerRewardsContext()
  const price = prices[symbol]?.price ?? 0

  const { earned, claimed } = data[address]
  const totalEarned = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  const totalClaimed = Object.values(claimed).reduce(
    (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
    0n,
  )

  return {
    data: Big((totalClaimed + totalEarned).toString())
      .div(WeiPerEther.toString())
      .mul(price),
    isLoading,
    error,
  }
}

export type BackerStakingHistory = {
  id: Address
  backerTotalAllocation: string
  accumulatedTime: string
  lastBlockTimestamp: string
  gauges: GaugeStakingHistory[]
}

export type GaugeStakingHistory = {
  allocation_: string
  gauge: Address
  accumulatedAllocationsTime: string
  lastBlockTimestamp: string
}

const BACKER_STAKING_HISTORY_QUERY = gql`
  query BackerStakingHistory($backer: Bytes) {
    backerStakingHistory(id: $backer) {
      id
      backerTotalAllocation
      accumulatedTime
      lastBlockTimestamp
      gauges {
        gauge
        accumulatedAllocationsTime
        allocation
        lastBlockTimestamp
      }
    }
  }
`

export const useGetBackerRBI = (backer: Address, { rbtc, rif }: Record<string, Token>) => {
  const {
    data: stakingHistory,
    loading: stakingHistoryLoading,
    error: stakingHistoryError,
  } = useQuery<{ backerStakingHistory: BackerStakingHistory }>(BACKER_STAKING_HISTORY_QUERY, {
    variables: { backer },
  })
  const {
    data: rbtcRewards,
    isLoading: rbtcRewardsLoading,
    error: rbtcRewardsError,
  } = useGetTokenRewards(rbtc)
  const { data: rifRewards, isLoading: rifRewardsLoading, error: rifRewardsError } = useGetTokenRewards(rif)
  const timestamp = useIntervalTimestamp()

  const { prices } = usePricesContext()

  const rbi = useMemo(() => {
    if (!stakingHistory?.backerStakingHistory) return Big(0)

    const {
      backerTotalAllocation: backerTotalAllocation_,
      lastBlockTimestamp: lastBlockTimestamp_,
      accumulatedTime: accumulatedTime_,
      gauges: gauges_,
    } = stakingHistory.backerStakingHistory

    const accumulatedAllocationsTime = gauges_.reduce(
      (
        acc,
        {
          accumulatedAllocationsTime: accumulatedAllocationsTime_,
          allocation_,
          lastBlockTimestamp: gaugeLastBlockTimestamp_,
        },
      ) => {
        const lastStakedSeconds = Big(timestamp.toString()).sub(gaugeLastBlockTimestamp_)
        return acc.add(accumulatedAllocationsTime_).add(Big(allocation_).mul(lastStakedSeconds))
      },
      Big(0),
    )

    const backerTotalAllocation = Big(backerTotalAllocation_)
    let accumulatedTime = Big(accumulatedTime_)
    if (backerTotalAllocation.gt(0)) {
      const lastStakedSeconds = Big(timestamp.toString()).sub(lastBlockTimestamp_)
      accumulatedTime = Big(accumulatedTime_).add(lastStakedSeconds)
    }

    const rifPrice = prices[rif.symbol]?.price ?? 0

    return accumulatedTime
      .mul(
        rbtcRewards.add(rifRewards).div(accumulatedAllocationsTime.div(WeiPerEther.toString()).mul(rifPrice)),
      )
      .mul(100)
  }, [stakingHistory, prices, rif.symbol, rbtcRewards, rifRewards, timestamp])

  const isLoading = stakingHistoryLoading || rbtcRewardsLoading || rifRewardsLoading
  const error = stakingHistoryError ?? rbtcRewardsError ?? rifRewardsError

  return {
    data: rbi,
    isLoading,
    error,
  }
}
