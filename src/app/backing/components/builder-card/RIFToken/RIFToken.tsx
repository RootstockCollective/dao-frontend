import { TokenImage } from '@/components/TokenImage'
import { RIF } from '@/lib/constants'
import { FC } from 'react'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'

interface RIFTokenProps {
  className?: string
  textClassName?: string
}

export const RIFToken: FC<RIFTokenProps> = ({ className, textClassName }) => {
  return (
    <div
      className={cn('flex items-center gap-1 flex-shrink-0 font-rootstock-sans', className)}
      data-testid="currentBackingToken"
    >
      <TokenImage symbol={RIF} size={16} />
      <Typography className={cn('text-xs text-v3-text-100', textClassName)}>stRIF</Typography>
    </div>
  )
}
