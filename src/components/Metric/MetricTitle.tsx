import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../../components/commonProps'
import { InfoIconButton, type InfoIconButtonProps } from '../IconButton/InfoIconButton'

export interface MetricTitleProps extends CommonComponentProps {
  title: ReactNode
  info: ReactNode
  infoIconProps?: Omit<InfoIconButtonProps, 'info'>
}

export const MetricTitle: FC<MetricTitleProps> = ({ title, info, className = '', infoIconProps }) => {
  const isTitleTextual = typeof title === 'string'

  return (
    <div data-testid="MetricTitle" className={cn('flex w-full items-start gap-2', className)}>
      {isTitleTextual ? <Typography>{title}</Typography> : title}
      <InfoIconButton info={info} className="cursor-pointer" {...infoIconProps} />
    </div>
  )
}
