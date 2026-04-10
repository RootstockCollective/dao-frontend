import { ReactNode } from 'react'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { CommonComponentProps } from '../../components/commonProps'
import { InfoIconButton, type InfoIconButtonProps } from '../IconButton/InfoIconButton'

interface MetricTitleProps extends CommonComponentProps {
  title: ReactNode
  info?: ReactNode
  infoIconProps?: Omit<InfoIconButtonProps, 'info'>
}

export const MetricTitle = ({ title, info, className = '', infoIconProps }: MetricTitleProps) => {
  return (
    <div data-testid="MetricTitle" className={cn('flex w-full items-start gap-2', className)}>
      <Paragraph className="text-v3-bg-accent-0 text-sm md:text-base">{title}</Paragraph>
      {info && <InfoIconButton info={info} className="cursor-pointer" {...infoIconProps} />}
    </div>
  )
}
