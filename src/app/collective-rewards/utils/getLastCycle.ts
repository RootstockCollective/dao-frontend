import { getCycle } from '@/app/collective-rewards/utils/getCycle'

export const getPreviousCycle = () => {
  const { cycleDuration, cycleEndTimestamp: currentCycleEndTimestamp } = getCycle()
  const cycleEndTimestamp = currentCycleEndTimestamp.minus({ days: +cycleDuration })
  const cycleStartTimestamp = cycleEndTimestamp.minus({ days: +cycleDuration })
  return { cycleStartTimestamp, cycleEndTimestamp, cycleDuration }
}
