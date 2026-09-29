import { STRIF } from '@/lib/constants'

import {
  ABI_BOOST,
  formatAbiBoostAmount,
  formatAbiBoostPercentage,
  formatAbiBoostTerm,
  formatMissingAmount,
} from './abiBoost.utils'

/**
 * Programme terms as they read in the copy. Screens interpolate these instead of writing the
 * figures out, so changing a term never means finding every sentence that mentions it.
 */
export const ABI_BOOST_LABELS = {
  /** `7.5%` */
  boost: formatAbiBoostPercentage(),
  /** `+7.5%` */
  boostDelta: `+${formatAbiBoostPercentage()}`,
  /** `12 months` */
  term: formatAbiBoostTerm(),
  /** `100,000 stRIF` */
  minBacking: formatAbiBoostAmount(ABI_BOOST.minBacking, STRIF),
} as const

export const BELOW_THRESHOLD_LABEL = 'Below eligibility threshold, not earning boost'

/** An edit that takes a boosted backing under the minimum. */
export const BOOST_WILL_STOP_LABEL = `Under ${ABI_BOOST_LABELS.minBacking}, this backing stops earning the boost`

/** An edit still short of the minimum. */
export const missingToBoostLabel = (missingWei: bigint): string =>
  `${formatMissingAmount(missingWei, STRIF)} to boost this backing`
