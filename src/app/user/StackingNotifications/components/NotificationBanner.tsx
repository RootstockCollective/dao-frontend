'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

import { Button } from '@/components/Button'
import { DismissButton } from '@/components/DismissButton'
import { BANNER_CTA_CLASSES, BANNER_MOBILE_OVERLAY } from '@/components/PageBanner'
import { cn } from '@/lib/utils'

const SURFACE = 'var(--color-warm-surface)'
const EMBER_DEEP = 'var(--color-ember-deep)'
const EMBER = 'var(--color-ember)'
const EMBER_ASH = 'var(--color-ember-ash)'

/** The card surface at `percent` opacity, for the stops of the scrim over the artwork. */
const surfaceAt = (percent: number) => `color-mix(in srgb, ${SURFACE} ${percent}%, transparent)`

/**
 * Stops of each streak, as % of the width: where the plain surface ends, the deep ember,
 * the ember's peak and the fall back to deep ember before the ash at the right edge.
 */
const EMBER_STREAKS = (
  [
    [38, 56, 72, 86],
    [44, 61, 76, 89],
    [40, 58, 74, 87],
  ] as const
).map(
  ([solidUntil, deep, peak, fade]) =>
    `linear-gradient(90deg, ${SURFACE} 0%, ${SURFACE} ${solidUntil}%, ${EMBER_DEEP} ${deep}%, ${EMBER} ${peak}%, ${EMBER_DEEP} ${fade}%, ${EMBER_ASH} 100%)`,
)

export const NOTIFICATION_ARTWORK_SCRIM = `linear-gradient(90deg, ${SURFACE} 0%, ${SURFACE} 32%, ${surfaceAt(86)} 52%, ${surfaceAt(60)} 74%, ${surfaceAt(72)} 100%)`

export interface NotificationBannerProps {
  title: ReactNode
  description: ReactNode
  onDismiss: () => void
  backgroundSrc?: string
  backgroundPosition?: string
  scrim?: string
  buttonText?: string
  buttonOnClick?: () => void
  rightContent?: ReactNode
  className?: string
}

export const NotificationBanner = ({
  title,
  description,
  onDismiss,
  backgroundSrc,
  backgroundPosition = '70% 50%',
  scrim = NOTIFICATION_ARTWORK_SCRIM,
  buttonText,
  buttonOnClick,
  rightContent,
  className,
}: NotificationBannerProps) => (
  <div
    data-testid="NotificationBanner"
    className={cn(
      'relative flex min-h-14 w-full items-stretch self-stretch overflow-hidden rounded-lg border border-v3-text-80/8 bg-warm-surface',
      className,
    )}
  >
    {backgroundSrc ? (
      <>
        <Image
          src={backgroundSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 768px) 90vw, 100vw"
          className="object-cover"
          style={{ objectPosition: backgroundPosition }}
        />
        <div className="absolute inset-0 md:hidden" style={{ background: BANNER_MOBILE_OVERLAY }} />
        <div className="absolute inset-0 hidden md:block" style={{ background: scrim }} />
      </>
    ) : (
      <div aria-hidden="true" className="absolute inset-0 flex flex-col" data-testid="NotificationStreaks">
        {EMBER_STREAKS.map(background => (
          <span key={background} className="flex-1" style={{ background }} />
        ))}
      </div>
    )}

    <div className="z-base relative flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 py-2.5 pl-5 pr-2.5 md:flex-nowrap">
      <span className="font-rootstock-sans text-banner-title shrink-0 whitespace-nowrap text-sm font-bold">
        {title}
      </span>
      {/* Clamped rather than truncated to one line, so the copy stays readable on desktop; the
          title carries the full text in case a longer one (or a translation) still overflows */}
      <span
        className="font-rootstock-sans min-w-0 basis-full text-sm text-warm-text-muted md:line-clamp-2 md:flex-1 md:basis-auto"
        title={typeof description === 'string' ? description : undefined}
        data-testid="NotificationDescription"
      >
        {description}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {rightContent}

        {buttonText && buttonOnClick && (
          <Button
            variant="primary"
            onClick={buttonOnClick}
            className={cn(
              BANNER_CTA_CLASSES,
              'h-8 w-fit rounded-md px-3.5 py-0 shadow-[0_2px_0_var(--color-banner-ink)]',
            )}
            textClassName="text-[13px] leading-none whitespace-nowrap"
          >
            {buttonText}
          </Button>
        )}

        <DismissButton
          variant="quiet"
          aria-label="Dismiss this notification"
          onClick={onDismiss}
          data-testid="DismissNotificationButton"
        />
      </div>
    </div>
  </div>
)
