import { BuilderState } from '@/app/builders/components/Table/BuilderTable.config'
import { Builder } from '@/app/collective-rewards/types'
import {
  isBuilderDeactivated,
  isBuilderInProgress,
  isBuilderKycRevoked,
  isBuilderPaused,
  isBuilderSelfPaused,
} from '@/app/collective-rewards/utils'
import { CommonComponentProps } from '@/components/commonProps'
import HourglassIcon from '@/components/Icons/HourglassIcon'
import { ParachuteIcon } from '@/components/Icons/ParachuteIcon'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { Paragraph } from '@/components/TypographyNew'
import { cn, truncate } from '@/lib/utils'
import Link from 'next/link'
import { FC } from 'react'

type DecorationOptionId = Exclude<BuilderState, 'active'> | 'extraRewards'
type BuilderStateTooltip = Record<DecorationOptionId, string>

const stateTooltips: BuilderStateTooltip = {
  extraRewards: 'Builder will airdrop extra rewards',
  deactivated: 'The Builder was removed by the Foundation.',
  revoked: 'The Builder was voted out by the community.',
  paused: "The Builder's KYC has been paused by the Foundation.",
  inProgress: "Builder's activation is in progress.",
  selfPaused: 'The Builder has paused their participation.',
}

const stateConfig = {
  extraRewards: {
    icon: ParachuteIcon,
    props: { useGradient: true },
    defaultColor: '',
    hoverColor: 'text-v3-bg-accent-100',
  },
  deactivated: {
    icon: WarningIcon,
    props: {},
    defaultColor: 'text-brand-rootstock-lime',
    hoverColor: 'text-v3-bg-accent-100',
  },
  revoked: {
    icon: WarningIcon,
    props: {},
    defaultColor: 'text-brand-rootstock-lime',
    hoverColor: 'text-v3-bg-accent-100',
  },
  paused: {
    icon: WarningIcon,
    props: {},
    defaultColor: 'text-brand-rootstock-lime',
    hoverColor: 'text-v3-bg-accent-100',
  },
  inProgress: {
    icon: HourglassIcon,
    props: { size: 18 },
    defaultColor: 'text-v3-bg-accent-0',
    hoverColor: 'text-v3-bg-accent-100',
  },
  selfPaused: {
    icon: WarningIcon,
    props: {},
    defaultColor: 'text-brand-rootstock-lime',
    hoverColor: 'text-v3-bg-accent-100',
  },
} as const

const createIcon = (decorationId: DecorationOptionId, isHovered: boolean) => {
  const config = stateConfig[decorationId]
  const IconComponent = config.icon
  const colorClass = isHovered ? config.hoverColor : config.defaultColor

  return <IconComponent {...config.props} className={colorClass} />
}

interface BuilderDecorationProps {
  decorationId: DecorationOptionId
  isHighlighted?: boolean
  className?: string
}

const BuilderDecoration: FC<BuilderDecorationProps> = ({ decorationId, isHighlighted, className }) => {
  return (
    <Tooltip
      side="top"
      align="center"
      className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm', className)}
      text={stateTooltips[decorationId]}
    >
      {createIcon(decorationId, Boolean(isHighlighted))}
    </Tooltip>
  )
}

export interface BuilderNameCellProps extends CommonComponentProps {
  builder: Builder
  isHighlighted?: boolean
  hasAirdrop?: boolean
}

const getStateDecorationId = (builder: Builder): Exclude<DecorationOptionId, 'extraRewards'> | null => {
  if (isBuilderDeactivated(builder)) {
    return 'deactivated'
  }

  if (isBuilderKycRevoked(builder.stateFlags)) {
    return 'revoked'
  }

  if (isBuilderPaused(builder.stateFlags)) {
    return 'paused'
  }

  if (isBuilderSelfPaused(builder.stateFlags)) {
    return 'selfPaused'
  }

  if (isBuilderInProgress(builder)) {
    return 'inProgress'
  }

  return null
}

export const BuilderNameCell: FC<BuilderNameCellProps> = ({
  builder,
  isHighlighted,
  hasAirdrop,
  className,
}) => {
  const stateDecorationId = getStateDecorationId(builder)
  const builderPageLink = `/proposals/${builder.proposal.id}`

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
          <BuilderDecoration
            decorationId="extraRewards"
            isHighlighted={isHighlighted}
            className={className}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {stateDecorationId && (
          <BuilderDecoration
            decorationId={stateDecorationId}
            isHighlighted={isHighlighted}
            className={className}
          />
        )}
      </div>
    </div>
  )
}
