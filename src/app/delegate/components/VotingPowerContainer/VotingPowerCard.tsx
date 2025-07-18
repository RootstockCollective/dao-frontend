import { ReactNode } from 'react'
import { Tooltip } from '@/components/Tooltip'
import { Paragraph, Span } from '@/components/TypographyNew'
import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { Metric } from '@/components/Metric'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'

interface CardTooltipProps {
  text: ReactNode
}

const CardTooltip = ({ text }: CardTooltipProps) => (
  <Tooltip
    text={<Span className="text-bg-100">{text}</Span>}
    side="top"
    align="center"
    className="bg-text-80 rounded-[4px] shadow-lg"
  >
    <KotoQuestionMarkIcon />
  </Tooltip>
)

interface CardProps {
  title: string
  tooltipTitle?: ReactNode
  contentValue?: ReactNode
  isLoading?: boolean
}

export const VotingPowerCard = ({ title, tooltipTitle, contentValue, isLoading }: CardProps) => {
  const fullTitle = (
    <div className="text-bg-0 flex gap-[4px] items-center">
      <Span>{title}</Span>
      {tooltipTitle && <CardTooltip text={tooltipTitle} />}
    </div>
  )

  const fullContent = (
    <div className="flex items-center gap-[4px]">
      <Paragraph className="text-[32px] font-[400] text-ellipsis">
        {contentValue !== undefined ? contentValue : ' - '}
      </Paragraph>
      {isLoading && <HourglassAnimatedIcon />}
    </div>
  )
  return (
    <Metric title={fullTitle} className="items-stretch">
      {fullContent}
    </Metric>
  )
}
