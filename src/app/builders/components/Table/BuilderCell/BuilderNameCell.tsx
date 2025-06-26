import { Paragraph } from '@/components/TypographyNew'
import { FC } from 'react'
import { CircleIcon } from '@/components/Icons'
import { cn, truncate } from '@/lib/utils'
import { ParachuteIcon } from '@/components/Icons/ParachuteIcon'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import HourglassIcon from '@/components/Icons/HourglassIcon'
import { createElement } from 'react'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import Link from 'next/link'

// Mapping object for builder states
const commonHoveredClassName = { className: 'text-v3-bg-accent-100' }
const BUILDER_STATES = {
  extraRewards: {
    icon: ParachuteIcon,
    tooltip: 'Extra rewards available',
    iconProps: { useGradient: true },
    hoveredIconProps: { ...commonHoveredClassName, useGradient: false },
  },
  warning: {
    icon: WarningIcon,
    tooltip: 'Warning: Action required',
    iconProps: { color: '#DEFF1A' },
    hoveredIconProps: commonHoveredClassName,
  },
  pending: {
    icon: HourglassIcon,
    tooltip: 'Pending approval',
    iconProps: { className: 'text-v3-bg-accent-0' },
    hoveredIconProps: commonHoveredClassName,
  },
} as const

interface BuilderNameCellProps {
  builderName: string
  builderPageLink: string
  isHighlighted?: boolean
  hasExtraRewards?: boolean
  hasWarning?: boolean
  isPending?: boolean
  className?: string
}

export const BuilderNameCell: FC<BuilderNameCellProps> = ({
  builderName,
  builderPageLink,
  isHighlighted,
  hasExtraRewards = false,
  hasWarning = false,
  isPending = false,
  className,
}) => {
  const iconPropsKey = isHighlighted ? 'hoveredIconProps' : 'iconProps'
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
            {truncate(builderName, 15)}
          </Paragraph>
        </Link>
        {hasExtraRewards && (
          <Tooltip text={BUILDER_STATES.extraRewards.tooltip}>
            {createElement(BUILDER_STATES.extraRewards.icon, BUILDER_STATES.extraRewards[iconPropsKey])}
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasWarning && (
          <Tooltip text={BUILDER_STATES.warning.tooltip}>
            {createElement(BUILDER_STATES.warning.icon, BUILDER_STATES.warning[iconPropsKey])}
          </Tooltip>
        )}
        {isPending && (
          <Tooltip text={BUILDER_STATES.pending.tooltip}>
            {createElement(BUILDER_STATES.pending.icon, BUILDER_STATES.pending[iconPropsKey])}
          </Tooltip>
        )}
      </div>
    </div>
  )
}
