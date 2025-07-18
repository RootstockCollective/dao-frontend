import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ButtonNew/Button'
import { Typography } from '@/components/TypographyNew/Typography'

export interface BannerContentProps {
  title: ReactNode
  description: ReactNode
  buttonText?: string
  buttonOnClick: () => void
  rightContent?: ReactNode
  className?: string
}

export const BannerContent: FC<BannerContentProps> = ({
  title,
  description,
  buttonText,
  buttonOnClick,
  rightContent,
  className = '',
}) => {
  return (
    <div className={cn('text-v3-text-0 w-full flex flex-row gap-2 items-center justify-between', className)}>
      <div className="flex flex-col gap-2 w-1/2">
        <Typography variant="h3">{title}</Typography>
        <Typography>{description}</Typography>
        {buttonText && (
          <Button variant="primary" onClick={buttonOnClick} className="w-fit">
            {buttonText}
          </Button>
        )}
      </div>
      {rightContent && <div className="flex-shrink-0 w-1/2 text-right">{rightContent}</div>}
    </div>
  )
}
