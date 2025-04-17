import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import Big from '@/lib/big'
import { useMemo } from 'react'
import { useCycleContext } from '@/app/collective-rewards/metrics'
import { useBackerRewardsContext, useGetBackerStakingHistory, Token } from '@/app/collective-rewards/rewards'
import { WeiPerEther } from '@/lib/constants'

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

export const useGetBackerRBI = (backer: Address, { rbtc, rif }: Record<string, Token>) => {
  const {
    data: stakingHistory,
    isLoading: stakingHistoryLoading,
    error: stakingHistoryError,
  } = useGetBackerStakingHistory(backer)
  const {
    data: rbtcRewards,
    isLoading: rbtcRewardsLoading,
    error: rbtcRewardsError,
  } = useGetTokenRewards(rbtc)
  const { data: rifRewards, isLoading: rifRewardsLoading, error: rifRewardsError } = useGetTokenRewards(rif)
  const {
    data: { timestamp },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()
  const { prices } = usePricesContext()

  const rbi = useMemo(() => {
    if (!stakingHistory) return Big(0)

    const { backerTotalAllocation_, lastBlockTimestamp_, accumulatedTime_, gauges_ } = stakingHistory

    const accumulatedAllocationsTime = gauges_.reduce(
      (acc, { accumulatedAllocationsTime_, allocation_, lastBlockTimestamp_: gaugeLastBlockTimestamp_ }) => {
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

  const isLoading = stakingHistoryLoading || rbtcRewardsLoading || rifRewardsLoading || cycleLoading
  const error = stakingHistoryError ?? rbtcRewardsError ?? rifRewardsError ?? cycleError

  return {
    data: rbi,
    isLoading,
    error,
  }
}
