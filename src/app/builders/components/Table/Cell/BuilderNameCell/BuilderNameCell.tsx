import { isActive } from '@/app/collective-rewards/active-builders'
import { Builder } from '@/app/collective-rewards/types'
import {
  isBuilderDeactivated,
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
import { FC } from 'react'
import { BuilderState } from '../../BuilderTable.config'

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

const stateIcons: Record<DecorationOptionId, React.ReactNode> = {
  extraRewards: <ParachuteIcon useGradient />,
  deactivated: <WarningIcon color="#DEFF1A" />,
  revoked: <WarningIcon color="#DEFF1A" />,
  paused: <WarningIcon color="#DEFF1A" />,
  inProgress: <HourglassIcon className="text-v3-bg-accent-0" />,
  selfPaused: <WarningIcon color="#DEFF1A" />,
}

const stateHoveredIcons: Record<DecorationOptionId, React.ReactNode> = {
  extraRewards: <ParachuteIcon useGradient className="text-v3-bg-accent-100" />,
  deactivated: <WarningIcon color="#DEFF1A" className="text-v3-bg-accent-100" />,
  revoked: <WarningIcon color="#DEFF1A" className="text-v3-bg-accent-100" />,
  paused: <WarningIcon color="#DEFF1A" className="text-v3-bg-accent-100" />,
  inProgress: <HourglassIcon className="text-v3-bg-accent-100" />,
  selfPaused: <WarningIcon color="#DEFF1A" className="text-v3-bg-accent-100" />,
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
      className={cn('bg-white rounded p-6 shadow-lg text-v3-bg-accent-100', className)}
      text={stateTooltips[decorationId]}
    >
      {isHighlighted ? stateHoveredIcons[decorationId] : stateIcons[decorationId]}
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

  if (!isActive(builder.stateFlags)) {
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

  return (
    <div className={cn('flex items-center justify-between w-full h-full', className)}>
      <div className="flex items-center gap-2">
        <Paragraph
          className={cn(
            'text-v3-primary font-rootstock-sans',
            isHighlighted && 'text-v3-bg-accent-100 underline underline-offset-2',
          )}
        >
          {truncate(builder.builderName, 18)}
        </Paragraph>
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
