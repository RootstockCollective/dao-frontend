import { cn } from '@/lib/utils'

export const Divider = ({ className }: { className?: string }) => {
  return <hr className={cn('bg-bg-60 h-px border-0 mb-6', className)} />
}
