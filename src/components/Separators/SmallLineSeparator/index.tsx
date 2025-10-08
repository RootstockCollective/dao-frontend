import { cn } from '@/lib/utils'
import { ClassNameValue } from 'tailwind-merge'

interface Props {
  className?: ClassNameValue
}

export const SmallLineSeparator = ({ className }: Props) => (
  <div className={cn('w-0.5 h-1.5 mx-2 rounded-full bg-v3-text-40', className)} />
)
