'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

import { Button } from '@/components/Button'
import { DismissButton } from '@/components/DismissButton'
import {
  BANNER_CTA_CLASSES,
  BANNER_DESKTOP_OVERLAY,
  BANNER_MOBILE_OVERLAY,
  BannerDecorativeSquares,
} from '@/components/PageBanner'
import { Header, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

export interface NotificationBannerProps {
  title: ReactNode
  description: ReactNode
  backgroundSrc: string
  onDismiss: () => void
  buttonText?: string
  buttonOnClick?: () => void
  rightContent?: ReactNode
  backgroundPosition?: string
  scrim?: string
  showDecorativeSquares?: boolean
  className?: string
}

/**
 * A single contextual notification: artwork anchored right, copy on the left,
 * its call to action, and a dismiss button.
 */
export const NotificationBanner = ({
  title,
  description,
  backgroundSrc,
  onDismiss,
  buttonText,
  buttonOnClick,
  rightContent,
  backgroundPosition = '100% 50%',
  scrim = BANNER_DESKTOP_OVERLAY,
  showDecorativeSquares = false,
  className,
}: NotificationBannerProps) => (
  <div
    data-testid="NotificationBanner"
    className={cn('relative w-full self-stretch overflow-hidden rounded bg-v3-bg-accent-100', className)}
  >
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

    {showDecorativeSquares && (
      <BannerDecorativeSquares width={24} height={24} className="absolute left-3 top-3 z-base" />
    )}

    <DismissButton
      aria-label="Dismiss this notification"
      onClick={onDismiss}
      className="absolute right-4 top-4 z-base"
      data-testid="DismissNotificationButton"
    />

    <div
      className={cn(
        'relative flex flex-col gap-4 px-4 py-5 md:h-[132px] md:flex-row md:items-center md:justify-between md:gap-6 md:px-10 md:py-0',
        showDecorativeSquares && 'pt-12 md:pt-0',
      )}
    >
      <div className="flex flex-col gap-1 md:max-w-[36rem]">
        <Header caps variant="h3" className="text-banner-title">
          {title}
        </Header>
        <Paragraph className="text-[15px] leading-[1.4] text-banner-body">{description}</Paragraph>
      </div>

      {rightContent}

      {buttonText && buttonOnClick && (
        <Button variant="primary" onClick={buttonOnClick} className={cn('shrink-0', BANNER_CTA_CLASSES)}>
          {buttonText}
        </Button>
      )}
    </div>
  </div>
)
