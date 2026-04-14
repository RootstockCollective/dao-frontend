import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const RIFToken = ({
  className,
  textClassName,
  size = 16,
}: {
  size?: number
  className?: string
  textClassName?: string
}) => {
  return (
    <div
      className={cn('flex items-center gap-1 font-rootstock-sans', className)}
      data-testid="currentBackingToken"
    >
      <TokenImage symbol={RIF} size={size} />
      <Span variant="body-xs" className={cn('text-v3-text-100', textClassName)}>
        stRIF
      </Span>
    </div>
  )
}
