import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { formatEther } from 'viem'

import { formatSymbol } from '@/app/shared/formatter'
import { NotificationBanner } from '@/app/user/StackingNotifications/components/NotificationBanner'
import { Button } from '@/components/Button'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { ABI_BOOST_LABELS } from '../abiBoost.labels'
import {
  AbiBoostStatus,
  BackingBoostHintState,
  formatAbiBoostAmount,
  formatVotingCountdown,
  getAbiBoostGuidance,
  getBackingBoostHint,
  isBelowAbiBoostThreshold,
} from '../abiBoost.utils'
import { useAbiBoostPosition, useIsAbiBoostEnabled } from '../hooks/useAbiBoost'
import { useBackedBuildersUnderDeactivationVote } from '../hooks/useBackedBuildersUnderDeactivationVote'
import { BACK_BUILDERS_PATH } from './AbiBoostModals'
import { BoostedRate, CurrentAbiRate } from './AbiBoostRates'
import { BelowThresholdTag, BoostPill } from './AbiBoostTags'

const { boost, boostDelta, minBacking, term } = ABI_BOOST_LABELS

const formatMissing = (missing: bigint) => formatAbiBoostAmount(formatEther(missing), STRIF)

const BANNER_COPY: Record<AbiBoostStatus, { title: string; description: string }> = {
  notEligible: {
    title: 'Back Builders, earn more',
    description: `Put ${minBacking} or more behind Builders and your rate jumps by ${boost}.`,
  },
  eligible: {
    title: "You're eligible for the boost",
    description: `Back Builders with ${minBacking} or more and the ${boostDelta} boost switches on for ${term}.`,
  },
  active: {
    title: `Congrats, your ${boost} boost is active`,
    description: `It runs for as long as ${minBacking} keeps backing Builders.`,
  },
}

/** Top of the Backing page: where the wallet stands in the boost programme. */
const AbiBoostBannerContent = () => {
  const router = useRouter()
  const { status, isLoading } = useAbiBoostPosition()
  // Session-only, like every other banner: it comes back on the next visit
  const [isDismissed, setIsDismissed] = useState(false)

  if (isLoading || isDismissed) return null
  const { title, description } = BANNER_COPY[status]
  return (
    <NotificationBanner
      title={title}
      description={description}
      buttonText="Choose a Builder"
      buttonOnClick={() => router.push(BACK_BUILDERS_PATH)}
      onDismiss={() => setIsDismissed(true)}
      className="mb-2"
    />
  )
}

export const AbiBoostBanner = () => (useIsAbiBoostEnabled() ? <AbiBoostBannerContent /> : null)

/**
 * One warning per backed Builder facing an open deactivation vote. It disappears on its own once
 * the backing moves elsewhere or the vote closes; dismissing it only lasts for the session.
 */
const DeactivationVoteBannersContent = () => {
  const router = useRouter()
  const buildersUnderVote = useBackedBuildersUnderDeactivationVote()
  const [dismissed, setDismissed] = useState<string[]>([])

  return buildersUnderVote
    .filter(({ builder, proposalId }) => !dismissed.includes(`${proposalId}:${builder}`))
    .map(({ builder, builderName, proposalId, secondsLeft }) => (
      <NotificationBanner
        key={`${proposalId}:${builder}`}
        title={`${builderName} is under a deactivation vote`}
        description={`Voting ends in ${formatVotingCountdown(secondsLeft)}. If it passes, backing this Builder stops earning. Reallocate before then to keep your rewards active.`}
        buttonText="Reallocate now"
        buttonOnClick={() => router.push(BACK_BUILDERS_PATH)}
        onDismiss={() => setDismissed(ids => [...ids, `${proposalId}:${builder}`])}
        className="mb-2"
      />
    ))
}

export const DeactivationVoteBanners = () =>
  useIsAbiBoostEnabled() ? <DeactivationVoteBannersContent /> : null

const STATUS_CHIP: Record<AbiBoostStatus, { label: string; className: string }> = {
  notEligible: { label: 'Not eligible', className: 'border-v3-text-100/20 text-v3-text-60' },
  eligible: { label: 'Eligible, not active', className: 'border-v3-text-100/25 text-v3-text-80' },
  active: { label: 'Active', className: 'border-v3-primary/60 text-v3-primary' },
}

const TermRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-6 border-b border-bg-40 py-3 last:border-b-0">
    <Span variant="body-s" className="text-text-60">
      {label}
    </Span>
    <Span variant="body-s" className="text-right">
      {children}
    </Span>
  </div>
)

/** Backing page card: the boost's terms and what the wallet still needs to earn it. */
const BoostedRateCardContent = () => {
  const router = useRouter()
  const position = useAbiBoostPosition()
  const { status, backing, isLoading } = position
  if (isLoading) return null

  const guidance = getAbiBoostGuidance(position)
  const isBelowThreshold = isBelowAbiBoostThreshold(backing)
  const chip = STATUS_CHIP[status]

  const message = (() => {
    switch (guidance.kind) {
      case 'active':
        return `Your backing of ${formatSymbol(backing, STRIF)} ${STRIF} earns ${boostDelta} on top of the current ABI. Keep ${minBacking} or more backing Builders to keep the rate.`
      case 'backMore':
        return isBelowThreshold
          ? `Back ${formatMissing(guidance.missing)} more to reach the ${minBacking} minimum and switch the boost on.`
          : `Your stRIF is staked but not backing. Back Builders with ${minBacking} or more and you'd earn ${boostDelta} on top of the current ABI.`
      case 'stakeMore':
        return `Stake ${formatMissing(guidance.missing)} more and back Builders with ${minBacking} or more to earn ${boostDelta} on top of the current ABI.`
    }
  })()

  return (
    <section
      className="flex w-full flex-col gap-6 rounded-sm bg-v3-bg-accent-80 p-6 md:flex-row md:gap-10"
      data-testid="BoostedRateCard"
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Header variant="h3" caps>
            Boosted rate
          </Header>
          <span
            className={cn(
              'rounded-full border px-3 py-1 font-rootstock-sans text-xs leading-none',
              chip.className,
            )}
            data-testid="BoostedRateStatus"
          >
            {chip.label}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <Header variant="h1" className={status === 'active' ? 'text-v3-primary' : 'text-text-60'}>
            {boostDelta}
          </Header>
          <Label variant="body-s" className="pb-2 text-text-60">
            on top of the current ABI
          </Label>
        </div>
        {isBelowThreshold && <BelowThresholdTag />}
        <Paragraph variant="body-s" className="text-text-60" data-testid="BoostedRateMessage">
          {message}
        </Paragraph>
        {guidance.kind === 'backMore' && (
          <Button
            variant="primary"
            className="w-fit"
            onClick={() => router.push(BACK_BUILDERS_PATH)}
            data-testid="BoostedRateBackBuilder"
          >
            Back a Builder
          </Button>
        )}
      </div>
      <div className="flex flex-col md:min-w-[320px]">
        <TermRow label="Current ABI">
          <CurrentAbiRate />
        </TermRow>
        <TermRow label="Rate with boost">
          <BoostedRate className="text-v3-primary" />
        </TermRow>
        <TermRow label="Term">{term}</TermRow>
        <TermRow label="Minimum">{minBacking}</TermRow>
        <TermRow label="Requirement">The stRIF must back Builders</TermRow>
      </div>
    </section>
  )
}

export const BoostedRateCard = () => (useIsAbiBoostEnabled() ? <BoostedRateCardContent /> : null)

const RATE_INFO = (
  <Label variant="body-s">
    Rate on this backing: <CurrentAbiRate /> current ABI + {boost} boost = <BoostedRate />, for {term}.
  </Label>
)

const hintContent = (hint: NonNullable<BackingBoostHintState>): ReactNode => {
  switch (hint.kind) {
    case 'active':
      return <BoostPill>Boost active · {boostDelta}</BoostPill>
    case 'willActivate':
      return (
        <span className="flex items-center gap-2">
          <BoostPill>This backing is eligible for a boost · {boostDelta}</BoostPill>
          <InfoIconButton info={RATE_INFO} tooltipClassName="max-w-xs" />
        </span>
      )
    case 'willDeactivate':
      return (
        <Span variant="body-xs" className="text-text-60" data-testid="BackingBoostHintText">
          Under {minBacking}, this backing stops earning the boost
        </Span>
      )
    case 'missing':
      return (
        <Span variant="body-xs" className="text-text-60" data-testid="BackingBoostHintText">
          {formatMissing(hint.missing)} to boost this backing
        </Span>
      )
    case 'belowThreshold':
      return <BelowThresholdTag />
  }
}

interface BackingBoostHintProps {
  /** On-chain backing, in wei. */
  current: bigint
  /** Backing with the unsaved edits, in wei. */
  next: bigint
  className?: string
}

/** One line under a backing total: whether it earns the boost, or what it lacks to. */
export const BackingBoostHintView = ({ current, next, className }: BackingBoostHintProps) => {
  const hint = getBackingBoostHint(current, next)
  if (!hint) return null
  return (
    <div className={cn('flex', className)} data-testid="BackingBoostHint">
      {hintContent(hint)}
    </div>
  )
}

export const BackingBoostHint = (props: BackingBoostHintProps) =>
  useIsAbiBoostEnabled() ? <BackingBoostHintView {...props} /> : null

/** Left side of the save drawer: what saving does to the boost, with the rate it would earn. */
const DrawerBoostSummaryContent = ({ current, next }: Omit<BackingBoostHintProps, 'className'>) => {
  const hint = getBackingBoostHint(current, next)
  if (!hint || hint.kind === 'belowThreshold') return null

  const content = (() => {
    switch (hint.kind) {
      case 'willActivate':
      case 'active':
        return (
          <>
            <span className="text-text-60">Boost on this backing</span>{' '}
            <span className="text-v3-primary">
              {boostDelta} for {term}
            </span>
            <span className="text-text-60"> · Rate on this backing </span>
            <BoostedRate className="text-v3-primary" />
          </>
        )
      case 'willDeactivate':
        return <span className="text-text-60">Under {minBacking}, this backing stops earning the boost</span>
      case 'missing':
        return <span className="text-text-60">{formatMissing(hint.missing)} to boost this backing</span>
    }
  })()

  return (
    <div className="font-rootstock-sans text-sm" data-testid="DrawerBoostSummary">
      {content}
    </div>
  )
}

export const DrawerBoostSummary = (props: Omit<BackingBoostHintProps, 'className'>) =>
  useIsAbiBoostEnabled() ? <DrawerBoostSummaryContent {...props} /> : null
