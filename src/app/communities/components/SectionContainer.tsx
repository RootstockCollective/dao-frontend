import type { ComponentProps, ReactNode } from 'react'

import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'

interface SectionContainerProps {
  title: string
  children: ReactNode
  rightContent?: ReactNode
  headerVariant?: ComponentProps<typeof Header>['variant']
  className?: string
  /** Applied to the content wrapper (between title and children). Default includes mt-8; pass e.g. mt-4 for 16px gap. */
  contentClassName?: string
  'data-testid'?: string
}

/**
 * SectionContainer is a reusable component that provides a styled container
 * Used across the communities section to display a title, optional right content, and children components.
 * @param title
 * @param rightContent
 * @param children
 * @param titleClassname
 * @constructor
 */
export const SectionContainer = ({
  title,
  rightContent,
  children,
  headerVariant = 'h2',
  className,
  contentClassName,
  'data-testid': dataTestId,
}: SectionContainerProps) => (
  <div className={cn('bg-bg-80 rounded py-8 px-4 md:p-6', className)} data-testid={dataTestId}>
    <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:mb-10">
      <Header variant={headerVariant} className="flex-1">
        {title}
      </Header>
      {rightContent && <div className="flex-1">{rightContent}</div>}
    </div>
    <div className={cn('mt-8', contentClassName)} data-testid="SectionContainerContent">
      {children}
    </div>
  </div>
)

export const SectionContainerWithSpinner = withSpinner(SectionContainer)
