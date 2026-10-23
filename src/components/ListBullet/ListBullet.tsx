import { cn } from '@/lib/utils'

/** Small hollow circle used as the marker of list items. */
export const ListBullet = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'mt-2 inline-block h-[6px] w-[6px] shrink-0 rounded-full border border-v3-text-60',
      className,
    )}
  />
)
