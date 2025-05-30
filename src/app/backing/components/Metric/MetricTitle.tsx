import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../commonProps'
import { InfoIconButton } from '../IconButton/InfoIconButton'

export type MetricTitleProps = CommonComponentProps & {
  title: ReactNode
  info: string
}

export const MetricTitle: FC<MetricTitleProps> = ({ title, info, className = '' }) => {
  const isTitleTextual = typeof title === 'string'

  return (
    <div data-testid="MetricTitle" className={cn('flex w-full items-start gap-2', className)}>
      {isTitleTextual ? <Typography className="grow">{title}</Typography> : title}

      <InfoIconButton info={info} />
    </div>
  )
}
