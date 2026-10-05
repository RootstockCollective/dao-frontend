import { ReactNode } from 'react'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

/**
 * Block shown in place of a section's content when there is nothing to show yet: an icon, a title,
 * a subtitle explaining why, and the action that gets the user past it.
 */
export interface EmptyStateProps {
  icon: ReactNode
  title: string
  subtitle: string
  action?: ReactNode
  className?: string
  'data-testid'?: string
}

export const EmptyState = ({
  icon,
  title,
  subtitle,
  action,
  className,
  'data-testid': dataTestId,
}: EmptyStateProps) => (
  <div
    className={cn('flex flex-col justify-center items-center py-20 px-6 bg-bg-80', className)}
    data-testid={dataTestId}
  >
    <div className="mb-6">{icon}</div>
    <div className="flex flex-col items-center justify-center">
      <Paragraph bold className="text-text-100 mt-1">
        {title}
      </Paragraph>
      <Paragraph className="text-text-60 text-center mb-6">{subtitle}</Paragraph>
      {action}
    </div>
  </div>
)
