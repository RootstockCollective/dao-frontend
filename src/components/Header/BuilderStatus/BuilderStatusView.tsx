import SeparatorBar from '@/components/SeparatorBar/SeparatorBar'
import { HourglassIcon } from '../../Icons/HourglassIcon'
import { Typography } from '@/components/TypographyNew/Typography'
import { HtmlHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ExtendedBuilderState } from './types'
import { WarningIcon } from '@/components/Icons'

interface BuilderStatusProps {
  builderState: ExtendedBuilderState
}

const builderStatusConfig: Record<
  ExtendedBuilderState,
  {
    className: HtmlHTMLAttributes<HTMLSpanElement>['className']
    icon?: React.ComponentType<{ size?: number }>
    iconSize?: number
  }
> = {
  active: {
    className: 'text-v3-success',
  },
  inProgress: {
    className: 'text-v3-primary',
    icon: HourglassIcon,
    iconSize: 16,
  },
  deactivated: {
    className: 'text-brand-rootstock-lime',
    icon: WarningIcon,
    iconSize: 18,
  },
  paused: {
    className: 'text-brand-rootstock-lime',
    icon: WarningIcon,
    iconSize: 18,
  },
}

export function BuilderStatusView({ builderState }: BuilderStatusProps) {
  const config = builderStatusConfig[builderState]
  const IconComponent = config.icon
  const size = config.iconSize

  return (
    <div className={cn('flex items-center font-rootstock-sans gap-2', config.className)}>
      <SeparatorBar />
      {IconComponent && <IconComponent size={size} />}
      <Typography variant="body-xs">BUILDER</Typography>
    </div>
  )
}

export default BuilderStatusView
