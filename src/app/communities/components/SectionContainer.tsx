import { ReactNode } from 'react'
import { Header } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

interface SectionContainerProps {
  title: string
  children: ReactNode
  rightContent?: ReactNode
  titleClassname?: string
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
  titleClassname = 'text-[32px]',
}: SectionContainerProps) => (
  <div className="bg-bg-80 p-[24px] rounded">
    <div className="flex flex-row justify-stretch mb-[40px]">
      <Header className={cn('flex-1', titleClassname)}>{title}</Header>
      <p className="flex-1">{rightContent}</p>
    </div>
    <div data-testid="SectionContainerContent">{children}</div>
  </div>
)
