import { ReactNode } from 'react'

import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { PAGE_TITLE_CLASSES } from './bannerAssets'

interface PageTitleProps {
  children: ReactNode
  className?: string
  dataTestId?: string
}

/** Title of a page that has no banner. Uses the same type as the banner titles. */
export const PageTitle = ({ children, className, dataTestId }: PageTitleProps) => (
  <Header caps variant="h1" className={cn(PAGE_TITLE_CLASSES, className)} data-testid={dataTestId}>
    {children}
  </Header>
)
