import { RIF, STRIF } from '@/lib/constants'

import {
  ABI_BOOST,
  formatAbiBoostAmount,
  formatAbiBoostPercentage,
  formatAbiBoostTerm,
  formatMissingAmount,
} from './abiBoost.utils'

export const ABI_BOOST_LABELS = {
  boost: formatAbiBoostPercentage(),
  boostDelta: `+${formatAbiBoostPercentage()}`,
  term: formatAbiBoostTerm(),
  minBacking: formatAbiBoostAmount(ABI_BOOST.minBacking, STRIF),
  minStake: formatAbiBoostAmount(ABI_BOOST.minBacking, RIF),
} as const

export const BELOW_THRESHOLD_LABEL = 'Below eligibility threshold, not earning boost'

export const BOOST_WILL_STOP_LABEL = `Under ${ABI_BOOST_LABELS.minBacking}, this backing stops earning the boost`

export const missingToBoostLabel = (missingWei: bigint): string =>
  `${formatMissingAmount(missingWei, STRIF)} to boost this backing`
