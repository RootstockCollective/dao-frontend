import { DateTime } from 'luxon'

import { Cycle } from '@/app/collective-rewards/metrics'
import { Header } from '@/components/Typography'

import {
  BANNER_CONFIGS,
  CYCLE_ENDED,
  CYCLE_ENDING,
  KYC_ONLY,
  NOT_BACKING,
  STACK_ARTWORK,
  START_BUILDING,
} from './constants'
import { BannerConfig } from './types'

const STACK_ORDER = [CYCLE_ENDED, CYCLE_ENDING, NOT_BACKING]

const BANNER_FAMILIES = new Map<string, string>([
  [CYCLE_ENDED, 'cycle'],
  [CYCLE_ENDING, 'cycle'],
])

/**
 * Picks the notifications to show. The stack holds one card per artwork in STACK_ARTWORK, so
 * the page still opens on its own content and every card is guaranteed a look of its own.
 *
 * @param bannerConfigs - Array of banner configurations to process
 * @returns The highest-priority banner configs, at most one per artwork
 *
 * @example
 * // A user whose cycle just ended and who has stRIF left to back sees
 * // CYCLE JUST ENDED with BACK under it, in that order, on every load
 */
export const selectBannerConfigs = (bannerConfigs: BannerConfig[]): BannerConfig[] => {
  if (bannerConfigs.length <= 1) {
    return bannerConfigs
  }

  const rank = ({ id }: BannerConfig) => {
    const position = STACK_ORDER.indexOf(id)
    return position === -1 ? STACK_ORDER.length : position
  }

  const seenFamilies = new Set<string>()

  return [...bannerConfigs]
    .sort((a, b) => rank(a) - rank(b))
    .filter(({ id }) => {
      const family = BANNER_FAMILIES.get(id)
      if (!family) return true
      if (seenFamilies.has(family)) return false

      seenFamilies.add(family)
      return true
    })
    .slice(0, STACK_ARTWORK.length)
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
  if (!cycle || !cycle.cycleNext || cycle.cycleNext.toMillis() <= 0) return null
  const diff = cycle.cycleNext.diffNow()
  const diffDays = diff.as('days')
  const isCycleEnding = diffDays >= 0 && diffDays < 4
  if (!isCycleEnding) return null
  const staticConfig = BANNER_CONFIGS[CYCLE_ENDING]
  if (!staticConfig) return null
  return {
    ...staticConfig,
    rightContent: (
      <Header variant="h1" className="text-banner-title">
        {`${diff.toFormat("d'd' hh'h' mm'm'")}`}
      </Header>
    ),
  }
}

export const getBannerConfigForCycleEnded = (cycle: Cycle): BannerConfig | null => {
  if (!cycle || !cycle.cycleStart) return null
  const isCycleEnded = DateTime.now().diff(cycle.cycleStart).as('days') < 3
  return isCycleEnded && BANNER_CONFIGS[CYCLE_ENDED] ? BANNER_CONFIGS[CYCLE_ENDED] : null
}
