'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

import { Button } from '@/components/Button'
import { DismissButton } from '@/components/DismissButton'
import {
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
  /** The decorative squares sit on the first card of the stack only. */
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
  showDecorativeSquares = false,
  className,
}: NotificationBannerProps) => (
  <div
    data-testid="NotificationBanner"
    className={cn(
      'relative w-full self-stretch overflow-hidden rounded bg-v3-bg-accent-100 text-v3-text-100',
      className,
    )}
  >
    <Image
      src={backgroundSrc}
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className="object-cover object-right"
    />
    <div className="absolute inset-0 md:hidden" style={{ background: BANNER_MOBILE_OVERLAY }} />
    <div className="absolute inset-0 hidden md:block" style={{ background: BANNER_DESKTOP_OVERLAY }} />

    {showDecorativeSquares && (
      <BannerDecorativeSquares width={24} height={24} className="absolute left-4 top-4 z-base" />
    )}

    <DismissButton
      aria-label="Dismiss this notification"
      onClick={onDismiss}
      className="absolute right-4 top-4 z-base"
      data-testid="DismissNotificationButton"
    />

    <div
      className={cn(
        'relative flex flex-col gap-4 px-4 py-5 md:min-h-[120px] md:flex-row md:items-center md:gap-6 md:px-6 md:pl-14',
        showDecorativeSquares && 'pt-12 md:pt-5',
      )}
    >
      <div className="flex flex-col gap-1 md:w-1/2 md:shrink-0 md:pr-6">
        <Header caps variant="h3">
          {title}
        </Header>
        <Paragraph>{description}</Paragraph>
      </div>

      {/* The button sits in a column of its own and hugs its right edge, so every
          notification lines its button up at the same spot regardless of label length
          or of whether the card carries right-hand content. */}
      <div className="flex md:flex-1 md:justify-end">
        {buttonText && buttonOnClick && (
          <Button variant="primary" onClick={buttonOnClick}>
            {buttonText}
          </Button>
        )}
      </div>

      <div className="md:w-[12rem] md:shrink-0 md:text-right">{rightContent}</div>
    </div>
  </div>
)
