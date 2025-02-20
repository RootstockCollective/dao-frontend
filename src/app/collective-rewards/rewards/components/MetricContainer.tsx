import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MetricsElementProps {
  children: ReactNode
  className?: string
}

export const MetricContainer = ({ children, className }: MetricsElementProps) => (
  <div className={cn('flex-1 min-w-[calc(20%-1rem)] w-[214px]', className)}>{children}</div>
)
