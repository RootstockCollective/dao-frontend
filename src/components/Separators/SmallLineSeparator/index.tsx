import { ClassNameValue } from 'tailwind-merge'

import { cn } from '@/lib/utils'

interface Props {
  className?: ClassNameValue
}

export const SmallLineSeparator = ({ className }: Props) => (
  <div className={cn('w-0.5 h-1.5 md:mx-4 mx-3 rounded-full bg-v3-text-40', className)} />
)
