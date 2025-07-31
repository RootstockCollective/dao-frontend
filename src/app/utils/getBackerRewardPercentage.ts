export const getBackerRewardPercentage = (
  previous: bigint,
  next: bigint,
  cooldownEndTime: bigint,
  timestampInSeconds?: number,
) => {
  const currentTimestamp = timestampInSeconds ?? Math.floor(Date.now() / 1000)
  const current = currentTimestamp < cooldownEndTime ? previous : next

  return {
    current,
    next,
    cooldownEndTime,
  }
}
