import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../../components/commonProps'
import { InfoIconButton, InfoIconButtonProps } from '../IconButton/InfoIconButton'

export type MetricTitleProps = CommonComponentProps & {
  title: ReactNode
  info: ReactNode
  infoButtonProps?: Omit<InfoIconButtonProps, 'content'>
}

export const MetricTitle: FC<MetricTitleProps> = ({ title, info, className = '', infoButtonProps }) => {
  const isTitleTextual = typeof title === 'string'
  return (
    <div data-testid="MetricTitle" className={cn('flex w-full items-start gap-2', className)}>
      {isTitleTextual ? <Typography className="text-v3-bg-accent-0">{title}</Typography> : title}
      <InfoIconButton content={info} className="cursor-pointer" {...infoButtonProps} />
    </div>
  )
}
