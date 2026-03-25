import { type ReactElement, type ReactNode } from 'react'

import { DecorativeSquares } from '@/app/backing/components/DecorativeSquares'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface StackableBannerProps extends CommonComponentProps {
  children: ReactNode | ReactNode[]
  background?: string
  /** Override the default mobile gradient. When omitted, falls back to the default purple/green mobile gradient. */
  mobileBackground?: string
  /** Gap between sections (e.g. "gap-2" for 8px). When set, section wrappers use no vertical padding. */
  contentGap?: string
  /** Main debris color (e.g. cream for BTC Vault card). */
  decorativeImageColor?: string
  /** Secondary debris color for the dark square (e.g. #171412 to match dark background). */
  decorativeSecondaryColor?: string
  testId?: string
}

export const StackableBanner = ({
  children,
  className = '',
  background = 'linear-gradient(270deg, #442351 0%, #C0F7FF 49.49%, #E3FFEB 139.64%)',
  mobileBackground,
  contentGap,
  decorativeImageColor = '#d2fbf6',
  decorativeSecondaryColor,
  testId = 'StackableBanner',
}: StackableBannerProps) => {
  // Flatten to array and filter out null/undefined so we don't render empty slots or extra dividers
  const childrenArray = (Array.isArray(children) ? children : [children]).filter(
    (c): c is ReactElement => c != null && c !== false,
  )
  const isDesktop = useIsDesktop()
  const hasMultipleSections = childrenArray.length > 1
  const useGap = contentGap != null

  return (
    <div
      className={cn('relative self-stretch py-6 px-10 text-v3-text-0 mt-7 md:mt-0', className)}
      style={{
        background: isDesktop
          ? background
          : (mobileBackground ?? 'linear-gradient(270deg, #7B83CF 0%, #E3FFEB 52.87%)'),
      }}
      data-testid={testId}
    >
      <DecorativeSquares
        className="absolute left-0 top-[-30px] z-base"
        color={decorativeImageColor}
        {...(decorativeSecondaryColor != null && { secondaryColor: decorativeSecondaryColor })}
      />

      <div
        className={cn(
          'relative flex flex-col items-start text-v3-text-0',
          contentGap,
          // No divider when contentGap is set: spacing only, no line between sections
          hasMultipleSections && !useGap && 'divide-y divide-v3-bg-accent-100/10',
        )}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className={cn('w-full', useGap ? 'py-0' : 'py-6 first:pt-0 last:pb-0')}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
