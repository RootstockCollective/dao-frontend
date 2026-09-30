import { ReactNode } from 'react'

import { formatSymbol } from '@/app/shared/formatter'
import { NotificationBanner } from '@/app/user/StackingNotifications/components/NotificationBanner'
import { Button } from '@/components/Button'
import { InfoIconButton } from '@/components/IconButton/InfoIconButton'
import { Header, Paragraph, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { formatCountdownFromSeconds } from '@/lib/utils/formatCountdown'

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
import { useSessionDismissals } from '../hooks/useSessionDismissals'
import { BoostedRate } from './AbiBoostRates'
import { AbiBoostRow, AbiBoostStatusChip, BelowThresholdTag, BoostPill } from './AbiBoostTags'
import { BOOSTED_RATE_INFO, HOW_THE_BOOST_WORKS_INFO } from './HowTheBoostWorks'
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

const AbiBoostBannerContent = () => {
  const goToBackBuilders = useGoToBackBuilders()
  const { status, isReady } = useAbiBoostPosition()
  // Per status, so dismissing the eligible banner still lets the one announcing the boost through
  const { isDismissed, dismiss } = useSessionDismissals('abi-boost-banner-dismissed')

  if (!isReady || isDismissed(status)) return null
  const { title, description } = BANNER_COPY[status]
  return (
    <NotificationBanner
      title={title}
      description={description}
      buttonText="Choose a Builder"
      buttonOnClick={goToBackBuilders}
      onDismiss={() => dismiss(status)}
    />
  )
}

export const AbiBoostBanner = withAbiBoostFlag(AbiBoostBannerContent)

const DeactivationVoteBannersContent = () => {
  const goToBackBuilders = useGoToBackBuilders()
  const buildersUnderVote = useBackedBuildersUnderDeactivationVote()
  const { isDismissed, dismiss } = useSessionDismissals('deactivation-vote-banners-dismissed')

  return buildersUnderVote
    .filter(({ builder, proposalId }) => !isDismissed(`${proposalId}:${builder}`))
    .map(({ builder, builderName, proposalId, secondsLeft }) => (
      <NotificationBanner
        key={`${proposalId}:${builder}`}
        title={`${builderName} is under a deactivation vote`}
        description={`Voting ends in ${formatCountdownFromSeconds(secondsLeft)}. If it passes, backing this Builder stops earning. Reallocate before then to keep your rewards active.`}
        buttonText="Reallocate now"
        buttonOnClick={goToBackBuilders}
        onDismiss={() => dismiss(`${proposalId}:${builder}`)}
      />
    ))
}

export const DeactivationVoteBanners = withAbiBoostFlag(DeactivationVoteBannersContent)

const STATUS_LABELS: Record<AbiBoostStatus, string> = {
  notEligible: 'Not eligible',
  eligible: 'Eligible, not active',
  active: 'Active',
}

const BoostedRateCardContent = () => {
  const goToBackBuilders = useGoToBackBuilders()
  const position = useAbiBoostPosition()
  const { status, stRifBalance, backing, isReady } = position
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
          : `Your ${formatSymbol(stRifBalance, STRIF)} ${STRIF} is staked but not backing. Back Builders with ${minBacking} or more and you'd earn ${boostDelta} on top of the current ABI.`
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
        <div className="flex items-center justify-between gap-3">
          <Header variant="h3" caps>
            Boosted rate
          </Header>
          <InfoIconButton info={HOW_THE_BOOST_WORKS_INFO} tooltipClassName="max-w-xs" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Header variant="h1" className={status === 'active' ? 'text-v3-primary' : 'text-text-60'}>
            {boost}
          </Header>
          <AbiBoostStatusChip status={status} data-testid="BoostedRateStatus">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {STATUS_LABELS[status]}
          </AbiBoostStatusChip>
        </div>
        <div className="flex flex-col gap-3 rounded-sm border border-bg-40 p-4">
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
      </div>
      <div className="flex flex-col md:min-w-[320px] *:last:border-b-0">
        <AbiBoostRow size="body-s" label="Term">
          {term}
        </AbiBoostRow>
        <AbiBoostRow size="body-s" label="Minimum">
          {minBacking}
        </AbiBoostRow>
        <AbiBoostRow size="body-s" label="Requirement">
          The minimum must be backing Builders
        </AbiBoostRow>
      </div>
    </section>
  )
}

export const BoostedRateCard = withAbiBoostFlag(BoostedRateCardContent)

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
          <InfoIconButton info={BOOSTED_RATE_INFO} tooltipClassName="max-w-xs" />
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
