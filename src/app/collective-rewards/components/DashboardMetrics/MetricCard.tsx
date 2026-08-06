import { ReactNode } from 'react'

import { Header, Label } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
  label: ReactNode
  value: ReactNode
  /** Secondary line under the value — a denomination, a delta, a breakdown. */
  sub?: ReactNode
  /** Rendered below everything, for a progress bar or similar. */
  footer?: ReactNode
  className?: string
  'data-testid'?: string
}

/** The small dark tiles in the dashboard's top row. */
export const MetricCard = ({
  label,
  value,
  sub,
  footer,
  className,
  'data-testid': dataTestId = 'MetricCard',
}: MetricCardProps) => (
  <div
    className={cn('bg-v3-bg-accent-80 rounded-lg p-4 md:p-5 flex flex-col gap-2 min-w-0', className)}
    data-testid={dataTestId}
  >
    <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
      {label}
    </Label>

    <div className="flex flex-col gap-0.5 min-w-0">
      <Header variant="h2" className="text-v3-text-100 truncate">
        {value}
      </Header>
      {sub}
    </div>

    {footer}
  </div>
)
