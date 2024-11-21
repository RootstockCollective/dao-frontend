import { toPercentage } from '@/app/collective-rewards/rewards'

export type BuilderRewardPercentage = {
  current: number
  next: number
  cooldownEndTime: bigint
}

export const getPercentageData = (previous: bigint, next: bigint, cooldownEndTime: bigint) => {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const previousPercentage = toPercentage(previous)
  const nextPercentage = toPercentage(next)
  let currentPercentage = currentTimestamp < cooldownEndTime ? previousPercentage : nextPercentage
  currentPercentage = Math.round(currentPercentage * 100) / 100

  const percentageData: BuilderRewardPercentage = {
    current: currentPercentage,
    next: nextPercentage,
    cooldownEndTime,
  }
  return percentageData
}
