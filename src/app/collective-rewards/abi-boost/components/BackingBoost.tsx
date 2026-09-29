import { ReactNode, useState } from 'react'

import { formatSymbol } from '@/app/shared/formatter'
import { NotificationBanner } from '@/app/user/StackingNotifications/components/NotificationBanner'
import { Button } from '@/components/Button'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { formatDuration } from '@/lib/utils/formatDuration'

import { ABI_BOOST_LABELS, BOOST_WILL_STOP_LABEL, missingToBoostLabel } from '../abiBoost.labels'
import {
  AbiBoostStatus,
  BackingBoostHintState,
  formatMissingAmount,
  getAbiBoostGuidance,
  getBackingBoostHint,
  isBelowAbiBoostThreshold,
} from '../abiBoost.utils'
import { useAbiBoostPosition, useGoToBackBuilders } from '../hooks/useAbiBoost'
import { useBackedBuildersUnderDeactivationVote } from '../hooks/useBackedBuildersUnderDeactivationVote'
import { BackingBoostChange, useBackingBoostChange } from '../hooks/useBackingBoostChange'
import { BoostedRate, CurrentAbiRate } from './AbiBoostRates'
import { AbiBoostRow, AbiBoostStatusChip, BelowThresholdTag, BoostPill } from './AbiBoostTags'
import { withAbiBoostFlag } from './withAbiBoostFlag'

const { boost, boostDelta, minBacking, term } = ABI_BOOST_LABELS

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
  const goToBackBuilders = useGoToBackBuilders()
  const { status, isReady } = useAbiBoostPosition()
  // Session-only, like every other banner: it comes back on the next visit
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isReady || isDismissed) return null
  const { title, description } = BANNER_COPY[status]
  return (
    <NotificationBanner
      title={title}
      description={description}
      buttonText="Choose a Builder"
      buttonOnClick={goToBackBuilders}
      onDismiss={() => setIsDismissed(true)}
    />
  )
}

export const AbiBoostBanner = withAbiBoostFlag(AbiBoostBannerContent)

/**
 * One warning per backed Builder facing an open deactivation vote. It disappears on its own once
 * the backing moves elsewhere or the vote closes; dismissing it only lasts for the session.
 */
const DeactivationVoteBannersContent = () => {
  const goToBackBuilders = useGoToBackBuilders()
  const buildersUnderVote = useBackedBuildersUnderDeactivationVote()
  const [dismissed, setDismissed] = useState<string[]>([])

  return buildersUnderVote
    .filter(({ builder, proposalId }) => !dismissed.includes(`${proposalId}:${builder}`))
    .map(({ builder, builderName, proposalId, secondsLeft }) => (
      <NotificationBanner
        key={`${proposalId}:${builder}`}
        title={`${builderName} is under a deactivation vote`}
        // Same countdown format as the vote itself shows on the proposals screens
        description={`Voting ends in ${formatDuration(secondsLeft)}. If it passes, backing this Builder stops earning. Reallocate before then to keep your rewards active.`}
        buttonText="Reallocate now"
        buttonOnClick={goToBackBuilders}
        onDismiss={() => setDismissed(ids => [...ids, `${proposalId}:${builder}`])}
      />
    ))
}

export const DeactivationVoteBanners = withAbiBoostFlag(DeactivationVoteBannersContent)

const STATUS_LABELS: Record<AbiBoostStatus, string> = {
  notEligible: 'Not eligible',
  eligible: 'Eligible, not active',
  active: 'Active',
}

/** Backing page card: the boost's terms and what the wallet still needs to earn it. */
const BoostedRateCardContent = () => {
  const goToBackBuilders = useGoToBackBuilders()
  const position = useAbiBoostPosition()
  const { status, backing, isReady } = position
  if (!isReady) return null

  const guidance = getAbiBoostGuidance(position)
  const isBelowThreshold = isBelowAbiBoostThreshold(backing)

  const message = (() => {
    switch (guidance.kind) {
      case 'active':
        return `Your backing of ${formatSymbol(backing, STRIF)} ${STRIF} earns ${boostDelta} on top of the current ABI. Keep ${minBacking} or more backing Builders to keep the rate.`
      case 'backMore':
        return isBelowThreshold
          ? `Back ${formatMissingAmount(guidance.missing, STRIF)} more to reach the ${minBacking} minimum and switch the boost on.`
          : `Your stRIF is staked but not backing. Back Builders with ${minBacking} or more and you'd earn ${boostDelta} on top of the current ABI.`
      case 'stakeMore':
        return `Stake ${formatMissingAmount(guidance.missing, STRIF)} more and back Builders with ${minBacking} or more to earn ${boostDelta} on top of the current ABI.`
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
          <AbiBoostStatusChip status={status} data-testid="BoostedRateStatus">
            {STATUS_LABELS[status]}
          </AbiBoostStatusChip>
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
            onClick={goToBackBuilders}
            data-testid="BoostedRateBackBuilder"
          >
            Back a Builder
          </Button>
        )}
      </div>
      <div className="flex flex-col md:min-w-[320px] *:last:border-b-0">
        <AbiBoostRow size="body-s" label="Current ABI">
          <CurrentAbiRate />
        </AbiBoostRow>
        <AbiBoostRow size="body-s" label="Rate with boost">
          <BoostedRate className="text-v3-primary" />
        </AbiBoostRow>
        <AbiBoostRow size="body-s" label="Term">
          {term}
        </AbiBoostRow>
        <AbiBoostRow size="body-s" label="Minimum">
          {minBacking}
        </AbiBoostRow>
        <AbiBoostRow size="body-s" label="Requirement">
          The stRIF must back Builders
        </AbiBoostRow>
      </div>
    </section>
  )
}

export const BoostedRateCard = withAbiBoostFlag(BoostedRateCardContent)

const RATE_INFO = (
  <Label variant="body-s">
    Rate on this backing: <CurrentAbiRate /> current ABI + {boost} boost = <BoostedRate />, for {term}.
  </Label>
)

const hintText = (text: string) => (
  <Span variant="body-xs" className="text-text-60" data-testid="BackingBoostHintText">
    {text}
  </Span>
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
      return hintText(BOOST_WILL_STOP_LABEL)
    case 'missing':
      return hintText(missingToBoostLabel(hint.missing))
    case 'belowThreshold':
      return <BelowThresholdTag />
  }
}

/** One line under a backing total: whether it earns the boost, or what it lacks to. */
export const BackingBoostHintView = ({ current, next }: BackingBoostChange) => {
  const hint = getBackingBoostHint(current, next)
  if (!hint) return null
  return (
    <div className="flex" data-testid="BackingBoostHint">
      {hintContent(hint)}
    </div>
  )
}

const BackingBoostHintContent = () => <BackingBoostHintView {...useBackingBoostChange()} />

export const BackingBoostHint = withAbiBoostFlag(BackingBoostHintContent)

/** Left side of the save drawer: what saving does to the boost, with the rate it would earn. */
export const DrawerBoostSummaryView = ({ current, next }: BackingBoostChange) => {
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
        return <span className="text-text-60">{BOOST_WILL_STOP_LABEL}</span>
      case 'missing':
        return <span className="text-text-60">{missingToBoostLabel(hint.missing)}</span>
    }
  })()

  return (
    <div className="font-rootstock-sans text-sm" data-testid="DrawerBoostSummary">
      {content}
    </div>
  )
}

const DrawerBoostSummaryContent = () => <DrawerBoostSummaryView {...useBackingBoostChange()} />

export const DrawerBoostSummary = withAbiBoostFlag(DrawerBoostSummaryContent)
