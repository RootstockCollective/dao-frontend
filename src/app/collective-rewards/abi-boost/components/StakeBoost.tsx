import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { parseEther } from 'viem'

import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { ExternalLinkIcon } from '@/components/Icons'
import { Header, Label, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { currentLinks } from '@/lib/links'
import { cn, formatNumberWithCommas } from '@/lib/utils'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import { getStakeBoostOutlook, StakeBoostOutlook } from '../abiBoost.utils'
import { CurrentAbiRate } from './AbiBoostRates'
import { AbiBoostRow, BelowThresholdTag } from './AbiBoostTags'
import { HOW_THE_BOOST_WORKS_INFO } from './HowTheBoostWorks'
import { withAbiBoostFlag } from './withAbiBoostFlag'

const { boostDelta, minStake } = ABI_BOOST_LABELS

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

/** What the amount being typed means for the boost. */
export const useStakeBoostOutlook = (amount: string): StakeBoostOutlook =>
  useMemo(() => getStakeBoostOutlook(toWei(amount)), [amount])

const OUTLOOK_MESSAGES: Record<StakeBoostOutlook, string> = {
  eligible: `You'll be eligible for a ${boostDelta} boost. Back a Builder after staking to switch it on.`,
  belowMinimum: `Stake ${minStake} or more to unlock a ${boostDelta} boost when you back Builders.`,
}

const StakeBoostNoticeContent = ({ amount }: { amount: string }) => {
  const outlook = useStakeBoostOutlook(amount)
  const isHighlighted = outlook === 'eligible'

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

      {/* One line on desktop, as in the design: message, info and Buy RIF side by side */}
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 md:flex-nowrap">
        {isHighlighted && <Sparkles size={16} className="shrink-0 text-v3-primary" aria-hidden="true" />}
        <Span
          variant="body-s"
          className={cn('md:whitespace-nowrap', isHighlighted ? 'text-v3-primary' : 'text-text-60')}
          data-testid="StakeBoostMessage"
        >
          {OUTLOOK_MESSAGES[outlook]}
        </Span>
        <InfoIconButton info={HOW_THE_BOOST_WORKS_INFO} tooltipClassName="max-w-xs" />
        <a
          href={currentLinks.getRif}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-rootstock-sans text-sm underline underline-offset-4"
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

/** The amount as typed, with thousands separators: the stake flow keeps up to 8 decimals. */
const formatStakeAmount = (amount: string, symbol: string): string =>
  `${formatNumberWithCommas(Big(amount || 0).toFixedNoTrailing(8))} ${symbol}`

interface StakeBoostSummaryProps {
  amount: string
  fromSymbol: string
  toSymbol: string
}

const StakeBoostSummaryContent = ({ amount, fromSymbol, toSymbol }: StakeBoostSummaryProps) => {
  const outlook = useStakeBoostOutlook(amount)

  return (
    <div className="mb-8 flex flex-col border-t border-bg-40" data-testid="StakeBoostSummary">
      <AbiBoostRow label="Amount">{formatStakeAmount(amount, fromSymbol)}</AbiBoostRow>
      <AbiBoostRow label="Becomes">{formatStakeAmount(amount, toSymbol)}</AbiBoostRow>
      <AbiBoostRow
        label="Boost eligibility"
        info={<InfoIconButton info={HOW_THE_BOOST_WORKS_INFO} tooltipClassName="max-w-xs" />}
      >
        {outlook === 'eligible' ? (
          <span className="text-v3-primary" data-testid="StakeBoostEligibility">
            Eligible for {boostDelta}, once backing a Builder
          </span>
        ) : (
          <BelowThresholdTag />
        )}
      </AbiBoostRow>
    </div>
  )
}

/** Confirm step of the stake flow: what is staked, what it becomes, and whether it qualifies. */
export const StakeBoostSummary = withAbiBoostFlag(StakeBoostSummaryContent)
