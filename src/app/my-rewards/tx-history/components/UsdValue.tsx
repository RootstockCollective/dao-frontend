'use client'

import { useMemo } from 'react'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface UsdValueProps {
  usd: string | string[]
  variant: 'desktop' | 'mobile'
  isHovered?: boolean // desktop only
  className?: string
}

/**
 * Shared component for displaying USD values.
 * Handles both single values and arrays of values.
 */
export const UsdValue = ({ usd, variant, isHovered = false, className }: UsdValueProps) => {
  const isDesktop = variant === 'desktop'
  const isMultipleUsd = Array.isArray(usd)

  const textColor = useMemo(() => {
    if (isDesktop && isHovered) {
      return 'text-black'
    }
    return isDesktop ? 'text-v3-text-100' : undefined
  }, [isDesktop, isHovered])

  if (isMultipleUsd) {
    return (
      <div className={cn('flex flex-col', isDesktop ? 'items-center gap-1' : 'items-start', className)}>
        {usd.map((value, idx) => (
          <Paragraph key={idx} className={textColor}>
            {value}
          </Paragraph>
        ))}
      </div>
    )
  }

  return <Paragraph className={cn(textColor, className)}>{usd}</Paragraph>
}
