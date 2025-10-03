import type { ComponentProps, ReactNode } from 'react'
import { Header } from '@/components/Typography'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

interface SectionContainerProps {
  title: string
  children: ReactNode
  rightContent?: ReactNode
  headerVariant?: ComponentProps<typeof Header>['variant']
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
}: SectionContainerProps) => (
  <div className="bg-bg-80 rounded py-8 px-4 md:p-6">
    <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:mb-10">
      <Header variant={headerVariant} className="flex-1">
        {title}
      </Header>
      {rightContent && <p className="flex-1">{rightContent}</p>}
    </div>
    <div className="mt-8" data-testid="SectionContainerContent">
      {children}
    </div>
  </div>
)

export const SectionContainerWithSpinner = withSpinner(SectionContainer)
