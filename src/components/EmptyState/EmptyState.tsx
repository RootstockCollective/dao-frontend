import { ReactNode } from 'react'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

export const EMPTY_STATE_ICON_COLOR = '#37322F'
export const EMPTY_STATE_ICON_SIZE = 88

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
