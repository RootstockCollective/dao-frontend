import { cn } from '@/lib/utils/utils'
import { CommonComponentProps } from '../commonProps'

export const Circle = ({ color, className }: CommonComponentProps<HTMLSpanElement> & { color: string }) => (
  <span className={cn('inline-block w-4 h-4 rounded-full', className)} style={{ backgroundColor: color }} />
)
