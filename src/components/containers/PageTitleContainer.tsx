import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export type PageTitleContainerProps = CommonComponentProps & {
  leftText: string
}

export const PageTitleContainer: FC<PageTitleContainerProps> = ({ leftText, className = '' }) => {
  return (
    <div data-testid="PageTitleContainer" className={cn('flex h-10 pr-36 items-center', className)}>
      <Typography
        variant="h1"
        className="grow text-left uppercase text-v3-text-100 leading-10 not-italic"
        data-testid="PageTitleContainerLeft"
      >
        {leftText} {/* FIXME: adopt Typography from DAO@koto */}
      </Typography>
    </div>
  )
}
