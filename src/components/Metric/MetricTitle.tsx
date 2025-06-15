import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../../components/commonProps'
import { InfoIconButton } from '../IconButton/InfoIconButton'

export type MetricTitleProps = CommonComponentProps & {
  title: ReactNode
  info: ReactNode
}

export const MetricTitle: FC<MetricTitleProps> = ({ title, info, className = '' }) => {
  const isTitleTextual = typeof title === 'string'
  const isInfoTextual = typeof info === 'string'

  return (
    <div data-testid="MetricTitle" className={cn('flex w-full items-start justify-between gap-2', className)}>
      {isTitleTextual ? <Typography className="grow">{title}</Typography> : title}
      {isInfoTextual ? <InfoIconButton info={info} className="cursor-pointer" /> : info}
    </div>
  )
}
