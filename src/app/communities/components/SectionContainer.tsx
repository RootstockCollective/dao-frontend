import { ComponentProps, ReactNode } from 'react'
import { Header } from '@/components/TypographyNew'

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
  <div className="bg-bg-80 p-[24px] rounded">
    <div className="flex flex-row justify-stretch mb-[40px]">
      <Header variant={headerVariant} className="flex-1">
        {title}
      </Header>
      <p className="flex-1">{rightContent}</p>
    </div>
    <div data-testid="SectionContainerContent">{children}</div>
  </div>
)
