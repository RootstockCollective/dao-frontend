'use client'

import { FC, useMemo } from 'react'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface AmountDisplayProps {
  amounts: Array<{ address: string; value: string; symbol: string }>
  type: 'Claim' | 'Back'
  increased?: boolean
  variant: 'desktop' | 'mobile'
  /**
   * Whether the row is currently hovered (desktop only)
   */
  isHovered?: boolean
  className?: string
}

/**
 * Shared component for displaying token amounts with optional arrow indicators.
 * Used in both desktop and mobile transaction history views.
 */
export const AmountDisplay: FC<AmountDisplayProps> = ({
  amounts,
  type,
  increased,
  variant,
  isHovered = false,
  className,
}) => {
  const isBack = type === 'Back'
  const showArrow = isBack && increased !== undefined
  const isDesktop = variant === 'desktop'
  const iconSize = isDesktop ? 16 : 14

  const valueColor = useMemo(() => {
    if (showArrow) {
      return increased ? 'text-v3-success' : 'text-error'
    }
    if (isDesktop && isHovered) {
      return 'text-black'
    }
    return 'text-v3-text-100'
  }, [showArrow, increased, isDesktop, isHovered])

  const symbolColor = useMemo(() => {
    if (isDesktop && isHovered) {
      return 'text-black'
    }
    return undefined
  }, [isDesktop, isHovered])

  const containerClass = isDesktop
    ? 'flex w-full flex-col items-stretch justify-center gap-2'
    : 'flex flex-col'

  return (
    <div className={cn(containerClass, className)}>
      {amounts.map(({ value, symbol }, idx) => (
        <div key={idx} className="grid grid-cols-2 items-center gap-1.5">
          <div className={cn('flex justify-end', valueColor)}>
            {showArrow && (
              <span className="flex items-center">
                {increased ? (
                  <ArrowUpIcon size={iconSize} color="#1bc47d" />
                ) : (
                  <ArrowDownIcon size={iconSize} color="#f68" />
                )}
              </span>
            )}
            <Paragraph className={isDesktop ? cn('leading-none', valueColor) : undefined}>{value}</Paragraph>
          </div>
          <div className="flex items-center gap-1">
            <TokenImage symbol={symbol} size={16} />
            <Span variant="tag-s" className={cn('leading-none', isDesktop ? symbolColor : undefined)}>
              {symbol}
              {idx < amounts.length - 1 ? ' +' : ''}
            </Span>
          </div>
        </div>
      ))}
    </div>
  )
}
