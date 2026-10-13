import { keepPreviousData } from '@tanstack/react-query'

import { CycleData } from '@/app/collective-rewards/shared/hooks/useGetABI'
import { useGetLastCycleRewardsWithStateSync } from '@/app/collective-rewards/shared/hooks/useGetLastCycleRewardsWithStateSync'
import { useReadBackersManager } from '@/shared/hooks/contracts'

import { useIntervalTimestamp } from './useIntervalTimestamp'

export type CycleDistributionStatus = 'distributed' | 'pending' | 'missed'

export type PendingDistributionStatus = Exclude<CycleDistributionStatus, 'distributed'>

export const isDistributionPending = (
  status: CycleDistributionStatus | undefined,
): status is PendingDistributionStatus => status === 'pending' || status === 'missed'

// startDistribution has no funding check, so an empty pot still finishes a distribution with 0 rewards
const isUnfunded = (cycleStart: bigint, lastCycle: CycleData | undefined) =>
  lastCycle !== undefined &&
  BigInt(lastCycle.currentCycleStart) === cycleStart &&
  Object.values(lastCycle.rewardPerToken).every(amount => BigInt(amount) === 0n)

interface DistributionState {
  now: bigint
  periodFinish?: bigint
  onDistributionPeriod?: boolean
  cycleStart?: bigint
  distributionDuration?: number
  lastCycle?: CycleData
}

const getStatus = ({
  now,
  periodFinish,
  onDistributionPeriod,
  cycleStart,
  distributionDuration,
  lastCycle,
}: DistributionState): CycleDistributionStatus | undefined => {
  if (periodFinish === undefined || cycleStart === undefined) return undefined
  if (periodFinish > now && !isUnfunded(cycleStart, lastCycle)) return 'distributed'
  if (onDistributionPeriod === undefined || distributionDuration === undefined) return undefined
  // A batched distribution started inside the window can keep running after it closes
  if (onDistributionPeriod || now < cycleStart + BigInt(distributionDuration)) return 'pending'
  return 'missed'
}

// The read hooks retry forever by default, which would keep the cards loading while the RPC is down
const READ_QUERY = { retry: 1 }

export const useCycleDistributionStatus = () => {
  const timestamp = useIntervalTimestamp()

  const periodFinish = useReadBackersManager({ functionName: 'periodFinish' }, READ_QUERY)
  const onDistributionPeriod = useReadBackersManager({ functionName: 'onDistributionPeriod' }, READ_QUERY)
  const distributionDuration = useReadBackersManager({ functionName: 'distributionDuration' }, READ_QUERY)
  const cycleStart = useReadBackersManager(
    { functionName: 'cycleStart', args: [timestamp] },
    { ...READ_QUERY, placeholderData: keepPreviousData },
  )
  const lastCycleRewards = useGetLastCycleRewardsWithStateSync()

  const status = getStatus({
    now: timestamp,
    periodFinish: periodFinish.data,
    onDistributionPeriod: onDistributionPeriod.data,
    cycleStart: cycleStart.data,
    distributionDuration: distributionDuration.data,
    lastCycle: lastCycleRewards.data?.[0],
  })

  const isChainLoading =
    periodFinish.isLoading ||
    onDistributionPeriod.isLoading ||
    distributionDuration.isLoading ||
    cycleStart.isLoading

  return {
    data: status,
    isLoading:
      (status === undefined && isChainLoading) || (status === 'distributed' && lastCycleRewards.isLoading),
  }
}
