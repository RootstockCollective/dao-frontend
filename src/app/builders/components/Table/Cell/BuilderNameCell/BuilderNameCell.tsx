import { BuilderState } from '@/app/builders/components/Table/BuilderTable.config'
import { Builder } from '@/app/collective-rewards/types'
import {
  builderInactiveStateMessage,
  getBuilderInactiveState,
  isBuilderInProgress,
} from '@/app/collective-rewards/utils'
import { CommonComponentProps } from '@/components/commonProps'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import { ParachuteIcon } from '@/components/Icons/ParachuteIcon'
import { IconProps } from '@/components/Icons/types'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { FC } from 'react'
import { BuilderName } from './BuilderName'

type DecorationOptionId = Exclude<BuilderState, 'active'> | 'extraRewards'
type BuilderStateTooltip = Record<DecorationOptionId, string>

type StateConfig = {
  [K in DecorationOptionId]: {
    icon: React.ComponentType<IconProps & { useGradient?: boolean }>
    defaultColor: string
    highlightColor: string
    useGradient?: boolean
  }
}

const stateTooltips: BuilderStateTooltip = {
  inProgress: "Builder's activation is in progress.",
  extraRewards: 'Builder will airdrop extra rewards',
  ...builderInactiveStateMessage,
}

const stateConfig: StateConfig = {
  extraRewards: {
    icon: ParachuteIcon,
    useGradient: true,
    defaultColor: '',
    highlightColor: 'text-v3-bg-accent-100',
  },
  deactivated: {
    icon: WarningIcon,
    defaultColor: 'text-brand-rootstock-lime',
    highlightColor: 'text-v3-bg-accent-100',
  },
  kycRevoked: {
    icon: WarningIcon,
    defaultColor: 'text-brand-rootstock-lime',
    highlightColor: 'text-v3-bg-accent-100',
  },
  paused: {
    icon: WarningIcon,
    defaultColor: 'text-brand-rootstock-lime',
    highlightColor: 'text-v3-bg-accent-100',
  },
  inProgress: {
    icon: HourglassIcon,
    defaultColor: 'text-v3-bg-accent-0',
    highlightColor: 'text-v3-bg-accent-100',
  },
  selfPaused: {
    icon: WarningIcon,
    defaultColor: 'text-brand-rootstock-lime',
    highlightColor: 'text-v3-bg-accent-100',
  },
}

const createIcon = (decorationId: DecorationOptionId, isHighlighted: boolean) => {
  const config = stateConfig[decorationId]
  const IconComponent = config.icon
  const colorClass = isHighlighted ? config.highlightColor : config.defaultColor

  return <IconComponent useGradient={config.useGradient} className={colorClass} />
}

interface BuilderDecorationProps {
  decorationId: DecorationOptionId
  isHighlighted?: boolean
  className?: string
}

const BuilderDecoration: FC<BuilderDecorationProps & { showTooltip?: boolean }> = ({
  decorationId,
  isHighlighted,
  className,
  showTooltip = true,
}) => {
  const icon = createIcon(decorationId, Boolean(isHighlighted))

  if (!showTooltip) {
    return icon
  }

  return (
    <Tooltip
      side="top"
      align="center"
      className={cn('rounded-sm z-50 bg-v3-text-80 text-v3-bg-accent-60 p-6 text-sm', className)}
      text={stateTooltips[decorationId]}
    >
      {icon}
    </Tooltip>
  )
}

export interface BuilderNameCellProps extends CommonComponentProps {
  builder: Builder
  isHighlighted?: boolean
  hasAirdrop?: boolean
}

const getStateDecorationId = (builder: Builder): Exclude<DecorationOptionId, 'extraRewards'> | null => {
  const inactiveState = getBuilderInactiveState(builder)
  if (inactiveState) return inactiveState

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
  const isDesktop = useIsDesktop()

  // Desktop layout - existing behavior with tooltips
  if (isDesktop) {
    return (
      <div className={cn('flex items-center justify-between w-full h-full', className)}>
        <div className="flex items-center gap-2">
          <BuilderName builder={builder} isHighlighted={isHighlighted} builderPageLink={builderPageLink} />
          {hasAirdrop && (
            <BuilderDecoration
              decorationId="extraRewards"
              isHighlighted={isHighlighted}
              className={className}
              showTooltip={true}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {stateDecorationId && (
            <BuilderDecoration
              decorationId={stateDecorationId}
              isHighlighted={isHighlighted}
              className={className}
              showTooltip={true}
            />
          )}
        </div>
      </div>
    )
  }

  // Mobile layout - show status text below name, no tooltips
  const statusText = stateDecorationId ? stateTooltips[stateDecorationId] : ''
  const statusColor = stateDecorationId
    ? isHighlighted
      ? stateConfig[stateDecorationId].highlightColor
      : stateConfig[stateDecorationId].defaultColor
    : ''
  const isInactive = getBuilderInactiveState(builder) != null

  return (
    <div className={cn('flex flex-col items-start w-full', className)}>
      <div className="flex items-center gap-2">
        <BuilderName builder={builder} isHighlighted={isHighlighted} builderPageLink={builderPageLink} />
        {hasAirdrop && (
          <BuilderDecoration decorationId="extraRewards" isHighlighted={isHighlighted} showTooltip={false} />
        )}
        {stateDecorationId && (
          <BuilderDecoration
            decorationId={stateDecorationId}
            isHighlighted={isHighlighted}
            showTooltip={false}
          />
        )}
      </div>
      {statusText && (
        <Paragraph className={cn('text-sm mt-1', isInactive ? statusColor : 'text-v3-text-100')}>
          {statusText}
        </Paragraph>
      )}
    </div>
  )
}
