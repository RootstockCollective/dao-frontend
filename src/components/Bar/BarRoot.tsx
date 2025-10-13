import { cn } from '@/lib/utils'
import { CommonComponentProps } from '../commonProps'

export type BarRootProps = CommonComponentProps & {}

export const BarRoot = ({ children, className, ...props }: BarRootProps) => {
  return (
    <div className={cn('flex flex-col items-start gap-2 self-stretch', className)} {...props}>
      {children}
    </div>
  )
}
