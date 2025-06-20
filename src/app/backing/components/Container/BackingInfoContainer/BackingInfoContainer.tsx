import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { CommonComponentProps } from '@/components/commonProps'

export type BackingInfoContainerProps = CommonComponentProps & {
  title: ReactNode
}

export const BackingInfoContainer: FC<BackingInfoContainerProps> = ({ className = '', title, children }) => {
  return (
    <div className={cn('relative w-full bg-v3-bg-accent-80 rounded p-6', className)}>
      <div className="flex flex-col gap-[56px]">
        <Typography className="text-v3-text-100 z-30 pt-4">{title}</Typography>
        {children}
      </div>
    </div>
  )
}
