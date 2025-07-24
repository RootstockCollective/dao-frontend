import { Cycle } from '@/app/collective-rewards/metrics'
import { BANNER_CONFIGS, CYCLE_ENDED, CYCLE_ENDING, KYC_ONLY, NOT_BACKING, START_BUILDING } from './constants'
import { BannerConfig } from './types'
import { Typography } from '@/components/TypographyNew/Typography'
import { DateTime } from 'luxon'

/**
 * Randomly shuffles banner configs and returns at most 2 banners.
 * This ensures we don't overwhelm the user with too many banners at once.
 *
 * @param bannerConfigs - Array of banner configurations to process
 * @returns Array of at most 2 randomly selected banner configs
 *
 * @example
 * // If you have 5 banner configs, this will return 2 randomly selected ones
 * // If you have 1 or fewer configs, returns them as-is
 */
export const selectBannerConfigsByCategory = (bannerConfigs: BannerConfig[]): BannerConfig[] => {
  // Dynamically group by categories that actually exist in the configs
  if (bannerConfigs.length <= 1) {
    return bannerConfigs
  }

  return [...bannerConfigs].sort(() => 0.5 - Math.random()).slice(0, 2)
}

/**
 * Maps a missing token type to its corresponding banner configuration.
 * Returns null if no token is missing or if no banner config exists for the token type.
 *
 * @param missingTokenType - The type of token the user is missing (NEED_RBTC, NEED_RIF, NEED_STRIF, or null)
 * @returns BannerConfig if a banner should be shown for the missing token, null otherwise
 *
 * @example
 * getBannerConfigForTokenStatus(NEED_RBTC) // Returns rBTC banner config
 * getBannerConfigForTokenStatus(null) // Returns null
 */
export const getBannerConfigForTokenStatus = (missingTokenType: string | null): BannerConfig | null => {
  if (!missingTokenType) return null
  return BANNER_CONFIGS[missingTokenType] ? BANNER_CONFIGS[missingTokenType] : null
}

export const getBannerConfigForBacking = (hasAvailableBacking: boolean): BannerConfig | null => {
  return hasAvailableBacking && BANNER_CONFIGS[NOT_BACKING] ? BANNER_CONFIGS[NOT_BACKING] : null
}

export const getBannerConfigForKycOnly = (isOnlyKycApproved: boolean): BannerConfig | null => {
  return isOnlyKycApproved && BANNER_CONFIGS[KYC_ONLY] ? BANNER_CONFIGS[KYC_ONLY] : null
}

export const getBannerConfigForStartBuilding = (isStartBuilding: boolean): BannerConfig | null => {
  return isStartBuilding && BANNER_CONFIGS[START_BUILDING] ? BANNER_CONFIGS[START_BUILDING] : null
}

export const getBannerConfigForCycleEnding = (cycle: Cycle): BannerConfig | null => {
  if (!cycle || !cycle.cycleNext) return null
  const diff = cycle.cycleNext.diffNow()
  const isCycleEnding = diff.as('days') < 4
  if (!isCycleEnding) return null
  const staticConfig = BANNER_CONFIGS[CYCLE_ENDING]
  if (!staticConfig) return null
  return {
    ...staticConfig,
    rightContent: (
      <Typography variant="h1" className="text-white">
        {/* eslint-disable-next-line quotes */}
        {`${diff.toFormat("d'd' hh'h' mm'm'")}`}
      </Typography>
    ),
  }
}

export const getBannerConfigForCycleEnded = (cycle: Cycle): BannerConfig | null => {
  if (!cycle || !cycle.cycleStart) return null
  const isCycleEnded = DateTime.now().diff(cycle.cycleStart).as('days') < 3
  return isCycleEnded && BANNER_CONFIGS[CYCLE_ENDED] ? BANNER_CONFIGS[CYCLE_ENDED] : null
}
