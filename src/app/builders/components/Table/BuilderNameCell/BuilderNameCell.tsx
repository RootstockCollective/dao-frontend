import { Builder } from '@/app/collective-rewards/types'
import { isBuilderDeactivated, isBuilderKycRevoked, isBuilderPaused } from '@/app/collective-rewards/utils'
import HourglassIcon from '@/components/Icons/HourglassIcon'
import { ParachuteIcon } from '@/components/Icons/ParachuteIcon'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { Paragraph } from '@/components/TypographyNew'
import { cn, truncate } from '@/lib/utils'
import Link from 'next/link'
import { createElement, FC } from 'react'

// Builder states map
const commonHoveredClassName = { className: 'text-v3-bg-accent-100' }
const BUILDER_STATES = {
  extraRewards: {
    icon: ParachuteIcon,
    tooltip: 'Builder will airdrop extra rewards',
    iconProps: { useGradient: true },
    hoveredIconProps: { ...commonHoveredClassName, useGradient: false },
  },
  warning: {
    icon: WarningIcon,
    tooltip: 'The Builder was removed by the Foundation',
    iconProps: { color: '#DEFF1A' },
    hoveredIconProps: commonHoveredClassName,
  },
  pending: {
    icon: HourglassIcon,
    tooltip: 'Builder activation is in progress',
    iconProps: { className: 'text-v3-bg-accent-0' },
    hoveredIconProps: commonHoveredClassName,
  },
}

interface BuilderStateIconProps {
  stateKey: keyof typeof BUILDER_STATES
  isHighlighted?: boolean
  className?: string
}

const BuilderStateIcon: FC<BuilderStateIconProps> = ({ stateKey, isHighlighted, className }) => {
  const state = BUILDER_STATES[stateKey]
  const iconPropsKey = isHighlighted ? 'hoveredIconProps' : 'iconProps'

  return (
    <Tooltip
      side="top"
      align="center"
      className={cn('bg-white rounded p-6 shadow-lg text-v3-bg-accent-100', className)}
      text={state.tooltip}
    >
      {createElement(state.icon, state[iconPropsKey])}
    </Tooltip>
  )
}

interface BuilderNameCellProps {
  builder: Builder
  builderPageLink: string
  isHighlighted?: boolean
  hasAirdrop?: boolean
  className?: string
}

enum BuilderIconState {
  PENDING = 'pending',
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

const getBuilderStateForIcon = (builder: Builder): BuilderIconState => {
  const isDeactivated = isBuilderDeactivated(builder)
  const isKycRevoked = isBuilderKycRevoked(builder.stateFlags)
  const isPaused = isBuilderPaused(builder.stateFlags)

  if (!builder.stateFlags) {
    return BuilderIconState.PENDING
  }

  if (isDeactivated || isKycRevoked) {
    return BuilderIconState.INACTIVE
  }

  const { activated, communityApproved } = builder.stateFlags

  if (!activated || !communityApproved) {
    return BuilderIconState.PENDING
  }

  if (isPaused) {
    return BuilderIconState.INACTIVE
  }

  return BuilderIconState.ACTIVE
}

export const BuilderNameCell: FC<BuilderNameCellProps> = ({
  builder,
  builderPageLink,
  isHighlighted,
  hasAirdrop,
  className,
}) => {
  const builderState = getBuilderStateForIcon(builder)

  return (
    <div className={cn('flex items-center justify-between w-full h-full', className)}>
      <div className="flex items-center gap-2">
        <Link href={builderPageLink} data-testid="builderName" target="_blank" rel="noopener noreferrer">
          <Paragraph
            className={cn(
              'text-v3-primary font-rootstock-sans',
              isHighlighted && 'text-v3-bg-accent-100 underline underline-offset-2',
            )}
          >
            {truncate(builder.builderName, 18)}
          </Paragraph>
        </Link>
        {hasAirdrop && (
          <BuilderStateIcon stateKey="extraRewards" isHighlighted={isHighlighted} className={className} />
        )}
      </div>
      <div className="flex items-center gap-2">
        {builderState === BuilderIconState.INACTIVE && (
          <BuilderStateIcon stateKey="warning" isHighlighted={isHighlighted} className={className} />
        )}
        {builderState === BuilderIconState.PENDING && (
          <BuilderStateIcon stateKey="pending" isHighlighted={isHighlighted} className={className} />
        )}
      </div>
    </div>
  )
}
