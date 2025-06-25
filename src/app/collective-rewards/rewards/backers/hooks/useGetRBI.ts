import { useIntervalTimestamp } from '@/app/collective-rewards/metrics/hooks/useIntervalTimestamp'
import { BackerStakingHistory, Token, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useMemo } from 'react'

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

export const useGetBackerRBI = (
  backerStakingHistory: BackerStakingHistory | undefined,
  { rbtc, rif }: Record<string, Token>,
) => {
  const {
    data: rbtcRewards,
    isLoading: rbtcRewardsLoading,
    error: rbtcRewardsError,
  } = useGetTokenRewards(rbtc)
  const { data: rifRewards, isLoading: rifRewardsLoading, error: rifRewardsError } = useGetTokenRewards(rif)
  const timestamp = useIntervalTimestamp()

  const { prices } = usePricesContext()

  const rbi = useMemo(() => {
    if (!backerStakingHistory) return Big(0)

    const { backerTotalAllocation, lastBlockTimestamp, accumulatedTime, gauges } = backerStakingHistory

    const accumulatedAllocationsTime = gauges.reduce(
      (acc, { accumulatedAllocationsTime, allocation, lastBlockTimestamp: gaugeLastBlockTimestamp }) => {
        const lastStakedSeconds = Big(timestamp.toString()).sub(gaugeLastBlockTimestamp)
        return acc.add(accumulatedAllocationsTime).add(lastStakedSeconds.mul(allocation))
      },
      Big(0),
    )

    const rifPrice = prices[rif.symbol]?.price ?? 0

    if (!rifPrice || accumulatedAllocationsTime.eq(0)) {
      return Big(0)
    }

    const priceAdjustedAllocTime = accumulatedAllocationsTime.div(WeiPerEther.toString()).mul(rifPrice)

    const bigBackerTotalAllocation = Big(backerTotalAllocation)
    let bigAccumulatedTime = Big(accumulatedTime)
    if (bigBackerTotalAllocation.gt(0)) {
      const lastStakedSeconds = Big(timestamp.toString()).sub(lastBlockTimestamp)
      bigAccumulatedTime = Big(accumulatedTime).add(lastStakedSeconds)
    }

    return bigAccumulatedTime.mul(rbtcRewards.add(rifRewards).div(priceAdjustedAllocTime)).mul(100)
  }, [backerStakingHistory, prices, rif.symbol, rbtcRewards, rifRewards, timestamp])

  const isLoading = rbtcRewardsLoading || rifRewardsLoading
  const error = rbtcRewardsError ?? rifRewardsError

  return {
    data: rbi,
    isLoading,
    error,
  }
}
