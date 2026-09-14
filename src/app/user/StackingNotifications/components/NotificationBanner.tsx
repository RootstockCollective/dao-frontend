'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

import { Button } from '@/components/Button'
import { DismissButton } from '@/components/DismissButton'
import { BannerDecorativeSquares } from '@/components/PageBanner'
import { Header, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

/** Fades the artwork out towards the left so the copy stays readable. */
const DESKTOP_OVERLAY =
  'linear-gradient(90deg, #171412 0%, #171412 24%, rgba(23,20,18,0.88) 38%, rgba(23,20,18,0.35) 58%, rgba(23,20,18,0) 76%)'
const MOBILE_OVERLAY =
  'linear-gradient(180deg, rgba(23,20,18,0.95) 0%, rgba(23,20,18,0.9) 55%, rgba(23,20,18,0.6) 100%)'

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
    <div className="absolute inset-0 md:hidden" style={{ background: MOBILE_OVERLAY }} />
    <div className="absolute inset-0 hidden md:block" style={{ background: DESKTOP_OVERLAY }} />

    {showDecorativeSquares && (
      <BannerDecorativeSquares className="absolute left-4 top-3 z-base md:left-6 md:top-4" />
    )}

    <DismissButton
      aria-label="Dismiss this notification"
      onClick={onDismiss}
      className="absolute right-4 top-4 z-base md:right-6"
      data-testid="DismissNotificationButton"
    />

    <div
      className={cn(
        'relative flex min-h-[120px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:px-6',
        // Leave room for the squares so they never sit on top of the title
        showDecorativeSquares && 'pt-12 md:pt-12',
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
