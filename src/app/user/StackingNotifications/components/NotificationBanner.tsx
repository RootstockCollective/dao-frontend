'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

import { Button } from '@/components/Button'
import { DismissButton } from '@/components/DismissButton'
import { BANNER_CTA_CLASSES, BANNER_MOBILE_OVERLAY } from '@/components/PageBanner'
import { cn } from '@/lib/utils'

const EMBER_STREAKS = [
  'linear-gradient(90deg, #141110 0%, #141110 38%, #5A1A06 56%, #B04A1A 72%, #5A1A06 86%, #1A1210 100%)',
  'linear-gradient(90deg, #141110 0%, #141110 44%, #5A1A06 61%, #B04A1A 76%, #5A1A06 89%, #1A1210 100%)',
  'linear-gradient(90deg, #141110 0%, #141110 40%, #5A1A06 58%, #B04A1A 74%, #5A1A06 87%, #1A1210 100%)',
]

export const NOTIFICATION_ARTWORK_SCRIM =
  'linear-gradient(90deg, #141110 0%, #141110 32%, rgba(20,17,16,0.86) 52%, rgba(20,17,16,0.6) 74%, rgba(20,17,16,0.72) 100%)'

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
      'relative flex min-h-14 w-full items-stretch self-stretch overflow-hidden rounded-lg border border-[rgba(228,225,218,0.08)] bg-[#141110]',
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
      <span className="font-rootstock-sans min-w-0 basis-full text-sm text-[#a29b90] md:flex-1 md:basis-auto md:truncate">
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
