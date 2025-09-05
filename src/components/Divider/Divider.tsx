import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export const Divider = ({ className }: { className?: string }) => {
  const isDesktop = useIsDesktop()
  return <hr className={cn('bg-bg-60 h-px border-0', isDesktop ? 'mb-6' : '', className)} />
}
