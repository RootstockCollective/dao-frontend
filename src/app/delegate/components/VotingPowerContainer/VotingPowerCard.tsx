import { ReactNode } from 'react'
import { Tooltip } from '@/components/Tooltip'
import { Span, Header } from '@/components/Typography'
import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { Metric } from '@/components/Metric'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface CardTooltipProps {
  text: ReactNode
}

const CardTooltip = ({ text }: CardTooltipProps) => (
  <Tooltip
    text={<Span className="text-bg-100">{text}</Span>}
    side="top"
    align="center"
    className="bg-text-80 rounded-sm shadow-lg max-w-[240px] md:max-w-none"
  >
    <KotoQuestionMarkIcon />
  </Tooltip>
)

export interface VotingPowerCardProps {
  title: string
  tooltipTitle?: ReactNode
  contentValue?: ReactNode
  isLoading?: boolean
  className?: string
}

export const VotingPowerCard = ({
  title,
  tooltipTitle,
  contentValue,
  isLoading,
  className,
}: VotingPowerCardProps) => {
  const isDesktop = useIsDesktop()

  const fullTitle = (
    <div className="text-bg-0 flex gap-1 items-center">
      <Span className="whitespace-nowrap">{title}</Span>
      {tooltipTitle && <CardTooltip text={tooltipTitle} />}
    </div>
  )

  const fullContent = (
    <div className="flex items-center gap-1">
      <Header variant={isDesktop ? 'h1' : 'h3'}>{contentValue}</Header>
      {isLoading && <HourglassAnimatedIcon />}
    </div>
  )
  return (
    <Metric title={fullTitle} className={cn('items-stretch', className)}>
      {fullContent}
    </Metric>
  )
}
