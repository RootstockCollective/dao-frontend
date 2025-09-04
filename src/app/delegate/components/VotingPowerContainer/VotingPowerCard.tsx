import { ReactNode } from 'react'
import { Tooltip } from '@/components/Tooltip'
import { Span } from '@/components/Typography'
import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { Metric } from '@/components/Metric'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'
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
}

export const VotingPowerCard = ({ title, tooltipTitle, contentValue, isLoading }: VotingPowerCardProps) => {
  const isDesktop = useIsDesktop()
  const fullTitle = (
    <div className="text-bg-0 flex gap-1 items-center">
      <Span>{title}</Span>
      {tooltipTitle && <CardTooltip text={tooltipTitle} />}
    </div>
  )

  return (
    <Metric title={fullTitle} className="items-stretch">
      <div className="flex items-center gap-1">
        <Span variant={isDesktop ? 'h1' : 'h3'} className="text-ellipsis">
          {contentValue || ' - '}
        </Span>
        {isLoading && <HourglassAnimatedIcon />}
      </div>
    </Metric>
  )
}
