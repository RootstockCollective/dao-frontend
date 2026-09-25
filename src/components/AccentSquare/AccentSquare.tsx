import { cn } from '@/lib/utils'

/** Small primary-colored square used as a decorative prefix on titles and eyebrows. */
export const AccentSquare = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={cn('inline-block size-2 shrink-0 bg-v3-primary', className)} />
)
