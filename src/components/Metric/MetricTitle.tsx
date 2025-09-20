import { BaseTypography } from '@/components/Typography/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '../../components/commonProps'
import { InfoIconButton, type InfoIconButtonProps } from '../IconButton/InfoIconButton'
import { Paragraph } from '@/components/Typography'

interface MetricTitleProps extends CommonComponentProps {
  title: ReactNode
  info?: ReactNode
  infoIconProps?: Omit<InfoIconButtonProps, 'info'>
}

export const MetricTitle: FC<MetricTitleProps> = ({ title, info, className = '', infoIconProps }) => {
  return (
    <div data-testid="MetricTitle" className={cn('flex w-full items-start gap-2', className)}>
      <Paragraph className="text-v3-bg-accent-0 text-sm md:text-base">{title}</Paragraph>
      {info && <InfoIconButton info={info} className="cursor-pointer" {...infoIconProps} />}
    </div>
  )
}
