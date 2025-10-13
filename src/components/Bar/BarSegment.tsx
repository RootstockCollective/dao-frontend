import { cn } from '@/lib/utils'
import { HTMLAttributes, ReactElement } from 'react'
import { CommonComponentProps } from '../commonProps'

export type BarSegmentProps = CommonComponentProps & {
  position: 'left' | 'center' | 'right'
}

const POSITIONAL_CLASSES: Record<BarSegmentProps['position'], HTMLAttributes<HTMLDivElement>['className']> = {
  left: 'bg-v3-rif-blue rounded-l-xl',
  center: 'bg-v3-primary',
  right: 'bg-v3-rif-blue rounded-r-xl',
}

export const BarSegment = ({ position, className, ...props }: BarSegmentProps): ReactElement => {
  return (
    <div
      className={cn('w-full h-full border-[0.5px] border-solid', POSITIONAL_CLASSES[position], className)}
      {...props}
    />
  )
}
