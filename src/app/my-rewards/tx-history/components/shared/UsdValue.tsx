'use client'

import { FC, useMemo } from 'react'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface UsdValueProps {
  usd: string | string[]
  variant: 'desktop' | 'mobile'
  /**
   * Whether the row is currently hovered (desktop only)
   */
  isHovered?: boolean
  /**
   * Whether to show the "USD" suffix (mobile only, defaults to true)
   */
  showSuffix?: boolean
  /**
   * Text variant for the Paragraph component
   */
  textVariant?: 'body' | 'body-s'
  className?: string
}

/**
 * Shared component for displaying USD values.
 * Handles both single values and arrays of values.
 */
export const UsdValue: FC<UsdValueProps> = ({
  usd,
  variant,
  isHovered = false,
  showSuffix = true,
  textVariant = 'body',
  className,
}) => {
  const isDesktop = variant === 'desktop'
  const isMultipleUsd = Array.isArray(usd)
  const suffix = !isDesktop && showSuffix ? ' USD' : ''

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
          <Paragraph key={idx} variant={textVariant} className={textColor}>
            {value}
            {suffix}
          </Paragraph>
        ))}
      </div>
    )
  }

  return (
    <Paragraph variant={textVariant} className={cn(textColor, className)}>
      {usd}
      {suffix}
    </Paragraph>
  )
}
