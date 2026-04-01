import { cn } from '@/lib/utils'
import { CommonComponentProps } from '../commonProps'

export type BarProps = CommonComponentProps & {}

export const Bar = ({ children, className, ...props }: BarProps) => {
  return (
    <div className={cn('flex items-start gap-[0.1875rem] self-stretch', className)} {...props}>
      {children}
    </div>
  )
}
