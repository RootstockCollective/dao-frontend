import { InfoLabel } from '@/components/InfoLabel'
import { Tooltip } from '@/components/Tooltip'
import { Label } from '@/components/Typography'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import { BoostedRate, CurrentAbiRate } from './AbiBoostRates'

const { boost, boostDelta, minBacking, term } = ABI_BOOST_LABELS

const TOOLTIP_CLASSES = 'max-w-xs rounded-sm bg-v3-text-80 p-4 text-v3-bg-accent-60'

export const HOW_THE_BOOST_WORKS_INFO = (
  <Label variant="body-s">
    Back Builders with {minBacking} or more and your backing earns {boostDelta} on top of the current ABI for{' '}
    {term}. It keeps the rate for as long as the backing stays at or above the minimum.
  </Label>
)

export const BOOSTED_RATE_INFO = (
  <Label variant="body-s">
    Rate on this backing: <CurrentAbiRate /> current ABI + {boost} boost = <BoostedRate />, for {term}.
  </Label>
)

export const HowTheBoostWorksLink = () => (
  <Tooltip text={HOW_THE_BOOST_WORKS_INFO} side="top" className={TOOLTIP_CLASSES}>
    <button type="button" className="flex cursor-pointer items-center gap-1" data-testid="HowTheBoostWorks">
      <InfoLabel>How the boost works</InfoLabel>
    </button>
  </Tooltip>
)
