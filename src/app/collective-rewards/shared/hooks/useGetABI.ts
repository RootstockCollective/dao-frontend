import Big from '@/lib/big'
import { CYCLES_PER_YEAR, WeiPerEther } from '@/lib/constants'

export interface CycleData {
  id: string
  currentCycleStart: number
  rewardPerToken: Record<string, string>
}

/** Per-cycle rate compounded over `CYCLES_PER_YEAR`, as a percentage. Inverse: `getCycleRateFromAbi`. */
export const calculateAbi = (rewardsPerStRif: Big, rifPrice: number): Big => {
  if (!rifPrice) {
    return Big(0)
  }

  return Big(1)
    .add(rewardsPerStRif.div(WeiPerEther.toString()).div(rifPrice))
    .pow(CYCLES_PER_YEAR)
    .minus(1)
    .mul(100)
}

/** Per-cycle rate (0..1) implied by an ABI percentage; the inverse of `calculateAbi`. */
export const getCycleRateFromAbi = (abiPct: number | null): number | null => {
  if (abiPct === null || !Number.isFinite(abiPct) || abiPct <= -100) return null

  return Math.pow(1 + abiPct / 100, 1 / CYCLES_PER_YEAR) - 1
}
