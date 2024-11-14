import { cn } from '@/lib/utils'
import { ComponentType, FC, ReactNode } from 'react'
import { useAccount } from 'wagmi'

interface MetricsElementProps {
  children: ReactNode
  className?: string
}

export const MetricContainer = ({ children, className }: MetricsElementProps) => (
  <div className={cn('flex-1 min-w-[calc(20%-1rem)] max-w-[17%]', className)}>{children}</div>
)
