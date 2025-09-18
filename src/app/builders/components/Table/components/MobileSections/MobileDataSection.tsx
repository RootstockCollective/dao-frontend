import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Paragraph, Span } from '@/components/Typography'

// Mobile row wrapper component
const MobileRowWrapper: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('w-full min-w-full flex', className)}>
    <div className="flex flex-col items-start text-left">{children}</div>
  </div>
)

// Mobile two-column wrapper component
const MobileTwoColumnWrapper: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('w-full flex', className)}>{children}</div>
)

const MobileColumnItem: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('w-[50%] flex flex-col items-start text-left', className)}>{children}</div>
)

const EmptyPlaceholder = () => {
  return <Span>-</Span>
}

// Generic mobile section wrapper with title, subtitle, and content
const MobileSectionWrapper: FC<{
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  hasValue?: boolean
}> = ({ title, subtitle, children, className, hasValue = true }) => (
  <div className={cn('flex flex-col w-full', className)}>
    <Paragraph variant="body-xs" className="text-v3-bg-accent-0 mb-[0.125rem]">
      {title}
    </Paragraph>
    {subtitle && <Paragraph className="text-v3-text-40 text-xs font-normal mb-2">{subtitle}</Paragraph>}
    <div className="flex flex-col items-start text-v3-text-100 ">
      {hasValue ? children : <EmptyPlaceholder />}
    </div>
  </div>
)

// Generic mobile data section component
export const MobileDataSection: FC<{
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  hasValue?: boolean
  layout?: 'single' | 'two-column'
}> = ({ title, subtitle, children, className, hasValue = true, layout = 'single' }) => {
  const content = (
    <MobileSectionWrapper title={title} subtitle={subtitle} hasValue={hasValue}>
      {children}
    </MobileSectionWrapper>
  )

  if (layout === 'two-column') {
    return <MobileTwoColumnWrapper className={className}>{content}</MobileTwoColumnWrapper>
  }

  return <MobileRowWrapper className={className}>{content}</MobileRowWrapper>
}

// Export wrapper components for use in other mobile sections
export { MobileRowWrapper, MobileTwoColumnWrapper, MobileColumnItem, MobileSectionWrapper, EmptyPlaceholder }
