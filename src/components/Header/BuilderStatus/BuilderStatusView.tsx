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
  }
> = {
  active: {
    className: 'text-v3-success',
  },
  inProgress: {
    className: 'text-v3-primary',
    icon: HourglassIcon,
  },
  deactivated: {
    className: 'text-brand-rootstock-lime',
    icon: WarningIcon,
  },
  paused: {
    className: 'text-brand-rootstock-lime',
    icon: WarningIcon,
  },
}

export function BuilderStatusView({ builderState }: BuilderStatusProps) {
  const config = builderStatusConfig[builderState]
  const IconComponent = config.icon

  return (
    <div className={cn('flex items-center font-rootstock-sans', config.className)}>
      <SeparatorBar className="mr-2" />
      {IconComponent && <IconComponent />}
      <Typography variant="body-xs" className="ml-[2px]">
        BUILDER
      </Typography>
    </div>
  )
}

export default BuilderStatusView
