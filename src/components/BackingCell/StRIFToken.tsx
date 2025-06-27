import { FC } from 'react'
import { cn } from '@/lib/utils'
import { TokenImage } from '@/components/TokenImage'
import { Typography } from '@/components/TypographyNew/Typography'
import { stRIF } from '@/lib/constants'

type StRIFTokenProps = {
  className?: string
  size?: number
  variant?: 'tag-s' | 'body-l' | 'body' | 'body-s' | 'body-xs'
  bold?: boolean
}

export const StRIFToken: FC<StRIFTokenProps> = ({ 
  className,
  size = 24,
  variant = 'tag-s',
  bold = false
}) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TokenImage symbol={stRIF} size={size} />
      <Typography variant={variant} bold={bold} className="text-white">
        stRIF
      </Typography>
    </div>
  )
} 