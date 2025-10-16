import { cn } from '@/lib/utils'
import { CommonComponentProps } from '../commonProps'

export type BarDividerProps = CommonComponentProps

export const BarDivider = ({ className, ...props }: BarDividerProps) => {
  return (
    <div
      className={cn('w-0.5 h-0.5 rounded-[0.625rem] bg-v3-text-40 shrink-0 self-center', className)}
      {...props}
    />
  )
}
