import { TokenImage } from '@/components/TokenImage'
import { RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'

export const RIFToken: FC<{ size?: number; className?: string; textClassName?: string }> = ({
  className,
  textClassName,
  size = 16,
}) => {
  return (
    <div
      className={cn('flex items-center gap-1 font-rootstock-sans', className)}
      data-testid="currentBackingToken"
    >
      <TokenImage symbol={RIF} size={size} />
      <Typography className={cn('text-xs text-v3-text-100', textClassName)}>stRIF</Typography>
    </div>
  )
}
