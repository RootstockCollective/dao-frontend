import { CYCLES_PER_YEAR } from '@/lib/constants'

export interface CycleData {
  id: string
  currentCycleStart: number
  rewardPerToken: Record<string, string>
}

/** Per-cycle rate (0..1) that, compounded over `CYCLES_PER_YEAR`, yields the given ABI percentage. */
export const getCycleRateFromAbi = (abiPct: number | null): number | null => {
  if (abiPct === null || !Number.isFinite(abiPct) || abiPct <= -100) return null

  return Math.pow(1 + abiPct / 100, 1 / CYCLES_PER_YEAR) - 1
}
