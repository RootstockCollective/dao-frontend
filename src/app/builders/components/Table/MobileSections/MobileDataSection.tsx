import { ReactNode } from 'react'

import { EmptyPlaceholder } from '@/components/Table/components'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

// Mobile row wrapper component
const MobileRowWrapper = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('w-full min-w-full flex', className)}>
    <div className="flex flex-col items-start text-left">{children}</div>
  </div>
)

// Mobile two-column wrapper component
const MobileTwoColumnWrapper = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('w-full flex', className)}>{children}</div>
)

const MobileColumnItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('w-[50%] flex flex-col items-start text-left', className)}>{children}</div>
)

interface MobileSectionWrapperProps {
  title: string
  children: ReactNode
  subtitle?: string
  className?: string
  hasValue?: boolean
  isRowSelected?: boolean
}

// Generic mobile section wrapper with title, subtitle, and content
const MobileSectionWrapper = ({
  title,
  subtitle,
  children,
  className,
  hasValue = true,
  isRowSelected = false,
}: MobileSectionWrapperProps) => (
  <div className={cn('flex flex-col w-full', className)}>
    <Paragraph
      variant="body-xs"
      className={cn('mb-[0.125rem]', isRowSelected ? 'text-v3-bg-accent-40' : 'text-v3-text-40')}
    >
      {title}
    </Paragraph>
    {subtitle && (
      <Paragraph
        className={cn(
          'text-xs font-normal mb-2 opacity-90',
          isRowSelected ? 'text-v3-bg-accent-40' : 'text-v3-text-40',
        )}
      >
        {subtitle}
      </Paragraph>
    )}
    <div className={cn('flex flex-col items-start', isRowSelected ? 'text-v3-text-0' : 'text-v3-text-100')}>
      {hasValue ? children : <EmptyPlaceholder />}
    </div>
  </div>
)

// Generic mobile data section component
export const MobileDataSection = ({
  title,
  subtitle,
  children,
  className,
  hasValue = true,
  layout = 'single',
  isRowSelected = false,
}: {
  title: string
  children: ReactNode
  subtitle?: string
  className?: string
  hasValue?: boolean
  layout?: 'single' | 'two-column'
  isRowSelected?: boolean
}) => {
  const content = (
    <MobileSectionWrapper title={title} subtitle={subtitle} hasValue={hasValue} isRowSelected={isRowSelected}>
      {children}
    </MobileSectionWrapper>
  )

  if (layout === 'two-column') {
    return <MobileTwoColumnWrapper className={className}>{content}</MobileTwoColumnWrapper>
  }

  return <MobileRowWrapper className={className}>{content}</MobileRowWrapper>
}

// Export wrapper components for use in other mobile sections
export { EmptyPlaceholder, MobileColumnItem, MobileRowWrapper, MobileSectionWrapper, MobileTwoColumnWrapper }
