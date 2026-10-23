import { CycleData } from '@/app/collective-rewards/shared/hooks/useGetABI'
import { useGetLastCycleRewardsWithStateSync } from '@/app/collective-rewards/shared/hooks/useGetLastCycleRewardsWithStateSync'
import { parseBigInt } from '@/lib/utils'
import { useReadBackersManager } from '@/shared/hooks/contracts'

import { useCycleContext } from '../context'
import { useIntervalTimestamp } from './useIntervalTimestamp'

export type CycleDistributionStatus = 'distributed' | 'pending' | 'missed'

export type PendingDistributionStatus = Exclude<CycleDistributionStatus, 'distributed'>

export const isDistributionPending = (
  status: CycleDistributionStatus | undefined,
): status is PendingDistributionStatus => status === 'pending' || status === 'missed'

// startDistribution has no funding check, so an empty pot still finishes a distribution with 0 rewards
const isUnfunded = (cycleStart: bigint, lastCycle: CycleData | undefined) => {
  if (lastCycle === undefined || parseBigInt(lastCycle.currentCycleStart) !== cycleStart) return false
  const amounts = Object.values(lastCycle.rewardPerToken ?? {})
  return amounts.length > 0 && amounts.every(amount => parseBigInt(amount) === 0n)
}

interface DistributionState {
  now: bigint
  periodFinish?: bigint
  onDistributionPeriod?: boolean
  cycleStart?: bigint
  endDistributionWindow?: bigint
  lastCycle?: CycleData
}

const getStatus = ({
  now,
  periodFinish,
  onDistributionPeriod,
  cycleStart,
  endDistributionWindow,
  lastCycle,
}: DistributionState): CycleDistributionStatus | undefined => {
  if (periodFinish === undefined || cycleStart === undefined) return undefined
  if (periodFinish > now && !isUnfunded(cycleStart, lastCycle)) return 'distributed'
  if (onDistributionPeriod === undefined || endDistributionWindow === undefined) return undefined
  // A batched distribution started inside the window can keep running after it closes
  if (onDistributionPeriod || now < endDistributionWindow) return 'pending'
  return 'missed'
}

// The read hooks retry forever by default, which would keep the cards loading while the RPC is down
const READ_QUERY = { retry: 1 }

// Until the CycleContext reads resolve its data holds epoch 0, which is not a cycle
const toSeconds = (date: { toSeconds(): number } | undefined): bigint | undefined => {
  const seconds = date?.toSeconds()
  return seconds ? BigInt(seconds) : undefined
}

/**
 * Whether the current cycle's rewards were distributed. `cycleStart` and `endDistributionWindow`
 * come from the surrounding `CycleContextProvider`, which already reads them from the BackersManager.
 */
export const useCycleDistributionStatus = () => {
  const now = useIntervalTimestamp()
  const { data: cycle, isLoading: isCycleLoading } = useCycleContext()

  const periodFinish = useReadBackersManager({ functionName: 'periodFinish' }, READ_QUERY)
  const onDistributionPeriod = useReadBackersManager({ functionName: 'onDistributionPeriod' }, READ_QUERY)
  const lastCycleRewards = useGetLastCycleRewardsWithStateSync()

  const status = getStatus({
    now,
    periodFinish: periodFinish.data,
    onDistributionPeriod: onDistributionPeriod.data,
    cycleStart: toSeconds(cycle?.cycleStart),
    endDistributionWindow: toSeconds(cycle?.endDistributionWindow),
    lastCycle: lastCycleRewards.data?.[0],
  })

  const isChainLoading = periodFinish.isLoading || onDistributionPeriod.isLoading || isCycleLoading

  return {
    data: status,
    isLoading:
      (status === undefined && isChainLoading) || (status === 'distributed' && lastCycleRewards.isLoading),
  }
}
