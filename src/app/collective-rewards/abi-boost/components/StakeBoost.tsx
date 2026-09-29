import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { parseEther } from 'viem'

import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { ExternalLinkIcon } from '@/components/Icons'
import { Header, Label, Span } from '@/components/Typography'
import { RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'
import { cn } from '@/lib/utils'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import { formatMissingAmount, getStakeBoostOutlook, StakeBoostOutlook } from '../abiBoost.utils'
import { useAbiBoostPosition } from '../hooks/useAbiBoost'
import { CurrentAbiRate } from './AbiBoostRates'
import { BelowThresholdTag } from './AbiBoostTags'
import { withAbiBoostFlag } from './withAbiBoostFlag'

const { boostDelta, minBacking, term } = ABI_BOOST_LABELS

const HOW_THE_BOOST_WORKS = (
  <Label variant="body-s">
    Back Builders with {minBacking} or more and your backing earns {boostDelta} on top of the current ABI for{' '}
    {term}. It keeps the rate for as long as the backing stays at or above the minimum.
  </Label>
)

const CURRENT_ABI_INFO = (
  <Label variant="body-s">
    Annual Backers Incentives: an estimate of the yearly rewards that backing Builders earns, based on the
    latest cycles.
  </Label>
)

/** The stake amount as wei, or zero while the input is empty or mid-edit. */
const toWei = (amount: string): bigint => {
  try {
    return amount ? parseEther(amount) : 0n
  } catch {
    return 0n
  }
}

/**
 * How the stake being prepared would leave the wallet regarding the boost, or `null` until the
 * wallet's position is known: a guess would tell an active backer they still have to qualify.
 */
export const useStakeBoostOutlook = (amount: string): StakeBoostOutlook | null => {
  const { stRifBalance, backing, isReady } = useAbiBoostPosition()
  return useMemo(
    () => (isReady ? getStakeBoostOutlook({ stRifBalance, backing }, toWei(amount)) : null),
    [isReady, stRifBalance, backing, amount],
  )
}

const outlookMessage = (outlook: StakeBoostOutlook): string => {
  switch (outlook.kind) {
    case 'active':
      return `Your ${boostDelta} boost is active while your backing stays at ${minBacking} or more.`
    case 'eligible':
      return `You'll be eligible for a ${boostDelta} boost. Back a Builder after staking to switch it on.`
    case 'short':
      return `Stake ${formatMissingAmount(outlook.missing, RIF)} or more to unlock a ${boostDelta} boost when you back Builders.`
  }
}

const StakeBoostNoticeContent = ({ amount }: { amount: string }) => {
  const outlook = useStakeBoostOutlook(amount)
  const isHighlighted = !!outlook && outlook.kind !== 'short'

  return (
    <div className="mt-6 border-t border-bg-40 pt-6" data-testid="StakeBoostNotice">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Span variant="body" className="text-text-60">
            Current ABI
          </Span>
          <InfoIconButton info={CURRENT_ABI_INFO} tooltipClassName="max-w-xs" />
        </div>
        <Header variant="h2">
          <CurrentAbiRate />
        </Header>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        {isHighlighted && <Sparkles size={16} className="shrink-0 text-v3-primary" aria-hidden="true" />}
        {outlook && (
          <>
            <Span
              variant="body-s"
              bold={isHighlighted}
              className={cn(isHighlighted ? 'text-v3-primary' : 'text-text-60')}
              data-testid="StakeBoostMessage"
            >
              {outlookMessage(outlook)}
            </Span>
            <InfoIconButton info={HOW_THE_BOOST_WORKS} tooltipClassName="max-w-xs" />
          </>
        )}
        <a
          href={currentLinks.getRif}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-rootstock-sans text-sm underline underline-offset-4"
        >
          Buy RIF
          <ExternalLinkIcon size={14} />
        </a>
      </div>
    </div>
  )
}

/** Step one of the stake flow: the current ABI and what the amount typed means for the boost. */
export const StakeBoostNotice = withAbiBoostFlag(StakeBoostNoticeContent)

const StakeBoostEligibilityRowContent = ({ amount }: { amount: string }) => {
  const outlook = useStakeBoostOutlook(amount)
  if (!outlook) return null

  return (
    <div
      className="mb-8 flex flex-wrap items-center justify-between gap-2 border-y border-bg-40 py-4"
      data-testid="StakeBoostEligibilityRow"
    >
      <div className="flex items-center gap-2">
        <Span variant="body" className="text-text-60">
          Boost eligibility
        </Span>
        <InfoIconButton info={HOW_THE_BOOST_WORKS} tooltipClassName="max-w-xs" />
      </div>
      {outlook.kind === 'short' ? (
        <BelowThresholdTag />
      ) : (
        <Span variant="body" className="text-v3-primary">
          {outlook.kind === 'active'
            ? `Active, ${boostDelta} on your backing`
            : `Eligible for ${boostDelta}, once backing a Builder`}
        </Span>
      )}
    </div>
  )
}

/** Confirm step of the stake flow: whether the stake qualifies for the boost. */
export const StakeBoostEligibilityRow = withAbiBoostFlag(StakeBoostEligibilityRowContent)
