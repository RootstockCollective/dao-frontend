import SeparatorBar from '@/components/SeparatorBar/SeparatorBar'
import { HourglassIcon } from '../../Icons/HourglassIcon'
import { Typography } from '@/components/TypographyNew/Typography'
import { HtmlHTMLAttributes } from 'react'
import { BuilderState } from '@/app/collective-rewards/types'
import { cn } from '@/lib/utils'

interface BuilderStatusProps {
  builderState: BuilderState
}

const builderStatusColorClasses: Record<BuilderState, HtmlHTMLAttributes<HTMLSpanElement>['className']> = {
  active: 'text-v3-success',
  inProgress: 'text-v3-primary',
}

export function BuilderStatusView({ builderState }: BuilderStatusProps) {
  return (
    <div
      className={cn('flex items-center font-rootstock-sans gap-2', builderStatusColorClasses[builderState])}
    >
      <SeparatorBar />
      {builderState === 'inProgress' && <HourglassIcon size={16} />}
      <Typography variant="body-xs">BUILDER</Typography>
    </div>
  )
}

export default BuilderStatusView
