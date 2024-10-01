import { getEpochCycle } from '@/app/bim/utils/getEpochCycle'

export const getPreviousEpochCycle = () => {
  const { epochDuration, epochEndTimestamp: currentEpochEndTimestamp } = getEpochCycle()
  const epochEndTimestamp = currentEpochEndTimestamp.minus({ days: +epochDuration })
  const epochStartTimestamp = epochEndTimestamp.minus({ days: +epochDuration })
  return { epochStartTimestamp, epochEndTimestamp, epochDuration }
}
