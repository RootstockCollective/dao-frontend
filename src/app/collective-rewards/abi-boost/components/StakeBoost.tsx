import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { parseEther } from 'viem'

import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { ExternalLinkIcon } from '@/components/Icons'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header, Label, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { RIF } from '@/lib/constants'
import { currentLinks } from '@/lib/links'
import { cn, formatNumberWithCommas } from '@/lib/utils'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import { formatMissingAmount, getStakeBoostOutlook, StakeBoostOutlook } from '../abiBoost.utils'
import { useAbiBoostPosition } from '../hooks/useAbiBoost'
import { CurrentAbiRate } from './AbiBoostRates'
import { AbiBoostRow, BelowThresholdTag } from './AbiBoostTags'
import { HOW_THE_BOOST_WORKS_INFO } from './HowTheBoostWorks'
import { withAbiBoostFlag } from './withAbiBoostFlag'

const { boostDelta, minBacking } = ABI_BOOST_LABELS

const CURRENT_ABI_INFO = (
  <Label variant="body-s">
    Annual Backers Incentives: an estimate of the yearly rewards that backing Builders earns, based on the
    latest cycles.
  </Label>
)

const toWei = (amount: string): bigint => {
  try {
    return amount ? parseEther(amount) : 0n
  } catch {
    return 0n
  }
}

// Null until the wallet's position is known: guessing it would misjudge a wallet that already holds stRIF
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
      return `Your ${boostDelta} boost is already active on your backing.`
    case 'eligible':
      return outlook.becomesEligible
        ? `You'll be eligible for a ${boostDelta} boost. Back a Builder after staking to switch it on.`
        : `You're eligible for a ${boostDelta} boost. Back Builders with ${minBacking} or more to switch it on.`
    case 'belowMinimum':
      return `Stake ${formatMissingAmount(outlook.missing, RIF)} or more to unlock a ${boostDelta} boost when you back Builders.`
  }
}

const StakeBoostNoticeContent = ({ amount }: { amount: string }) => {
  const outlook = useStakeBoostOutlook(amount)
  const isHighlighted = outlook !== null && outlook.kind !== 'belowMinimum'

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

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 md:flex-nowrap">
        {isHighlighted && <Sparkles size={16} className="shrink-0 text-v3-primary" aria-hidden="true" />}
        {outlook && (
          <Span
            variant="body-s"
            className={cn('md:whitespace-nowrap', isHighlighted ? 'text-v3-primary' : 'text-text-60')}
            data-testid="StakeBoostMessage"
          >
            {outlookMessage(outlook)}
          </Span>
        )}
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

export const StakeBoostNotice = withAbiBoostFlag(StakeBoostNoticeContent)

const formatStakeAmount = (amount: string, symbol: string): string =>
  `${formatNumberWithCommas(Big(amount || 0).toFixedNoTrailing(8))} ${symbol}`

interface StakeBoostSummaryProps {
  amount: string
  fromSymbol: string
  toSymbol: string
  amountInCurrency?: string
}

const eligibilityContent = (outlook: StakeBoostOutlook | null) => {
  if (!outlook) return <LoadingSpinner size="small" />
  switch (outlook.kind) {
    case 'active':
      return (
        <span className="text-v3-primary" data-testid="StakeBoostEligibility">
          Boost active · {boostDelta}
        </span>
      )
    case 'eligible':
      return (
        <span className="text-v3-primary" data-testid="StakeBoostEligibility">
          Eligible for {boostDelta}, once backing a Builder
        </span>
      )
    case 'belowMinimum':
      return <BelowThresholdTag />
  }
}

const StakeBoostSummaryContent = ({
  amount,
  fromSymbol,
  toSymbol,
  amountInCurrency,
}: StakeBoostSummaryProps) => {
  const outlook = useStakeBoostOutlook(amount)

  return (
    <div className="mb-8 flex flex-col border-t border-bg-40" data-testid="StakeBoostSummary">
      <AbiBoostRow label="Amount">
        {formatStakeAmount(amount, fromSymbol)}
        {amountInCurrency && (
          <span className="ml-2 text-text-60" data-testid="StakeBoostAmountInCurrency">
            {amountInCurrency}
          </span>
        )}
      </AbiBoostRow>
      <AbiBoostRow label="Becomes">{formatStakeAmount(amount, toSymbol)}</AbiBoostRow>
      <AbiBoostRow
        label="Boost eligibility"
        info={<InfoIconButton info={HOW_THE_BOOST_WORKS_INFO} tooltipClassName="max-w-xs" />}
      >
        {eligibilityContent(outlook)}
      </AbiBoostRow>
    </div>
  )
}

export const StakeBoostSummary = withAbiBoostFlag(StakeBoostSummaryContent)
