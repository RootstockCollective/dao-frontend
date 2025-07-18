import { cn } from '@/lib/utils'
import { ClassNameValue } from 'tailwind-merge'

interface Props {
  className?: ClassNameValue
}

export const SmallLineSeparator = ({ className }: Props) => {
  return <div className={cn('w-[2px] h-1.5 bg-v3-text-40 mx-4 rounded-[10px]', className)} />
}
