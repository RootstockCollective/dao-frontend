import { ReactNode } from 'react'

import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { BannerDecorativeSquares } from './BannerDecorativeSquares'

interface PageTitleProps {
  children: ReactNode
  className?: string
  'data-testid'?: string
}

/**
 * Title of a page that has no banner. Carries the same decorative squares and type as the
 * banner titles, so every page opens the same way.
 */
export const PageTitle = ({ children, className, 'data-testid': dataTestId }: PageTitleProps) => (
  <div className={cn('flex flex-col gap-4', className)}>
    <BannerDecorativeSquares />
    <Header caps variant="h1" className="text-3xl leading-10" data-testid={dataTestId}>
      {children}
    </Header>
  </div>
)
