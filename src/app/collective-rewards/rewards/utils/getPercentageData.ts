import { toPercentage } from '@/app/collective-rewards/rewards'

// TODO: this is a duplicate of BackerRewardPercentage
export type BuilderRewardPercentage = {
  current: number
  next: number
  cooldownEndTime: bigint
}

// TODO: get the percentage in bigint
export const getPercentageData = (
  previous: bigint,
  next: bigint,
  cooldownEndTime: bigint,
  timestampInSeconds?: number,
) => {
  const currentTimestamp = timestampInSeconds ?? Math.floor(Date.now() / 1000)
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
