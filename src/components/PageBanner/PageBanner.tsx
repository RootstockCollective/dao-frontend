'use client'

import { ReactNode, useState } from 'react'

import { DismissButton } from '@/components/DismissButton'
import { MoltenBackground } from '@/components/MoltenBackground'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { BANNER_EYEBROW_CLASSES, BANNER_HEADER_OVERLAY, BANNER_MOBILE_OVERLAY } from './bannerAssets'
import { BannerDecorativeSquares } from './BannerDecorativeSquares'

export interface PageBannerProps {
  title: string
  /**
   * Renders the dismiss button. The dismissal lasts for the session only: a reload
   * brings the banner back. Omit it for a permanent banner.
   */
  dismissible?: boolean
  /** Optional intro copy. Omit it for banners that only carry the page title. */
  description?: ReactNode
  /** Short kicker shown above the title. */
  eyebrow?: string
  /** Rendered at the bottom right of the banner, typically an external link. */
  bottomRight?: ReactNode
  /** Rendered under the description, typically a call to action and/or metrics. */
  children?: ReactNode
  className?: string
  dataTestId?: string
}

/**
 * Page hero: the still molten background shared by every page, title, intro copy and
 * optional call to action. When dismissible, closing it hides the banner until the next
 * page load; the title stays in the page as a visually hidden heading.
 */
export const PageBanner = ({
  dismissible = false,
  title,
  description,
  eyebrow,
  bottomRight,
  children,
  className,
  dataTestId = 'PageBanner',
}: PageBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false)

  if (dismissible && isDismissed) {
    // The banner carries the page's only heading: keep it for assistive technology
    return (
      <Header caps variant="h1" className="sr-only">
        {title}
      </Header>
    )
  }

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'relative w-full self-stretch overflow-hidden rounded bg-v3-bg-accent-100 text-banner-title',
        className,
      )}
    >
      <MoltenBackground tone="dark" animated={false} />
      <div className="absolute inset-0 md:hidden" style={{ background: BANNER_MOBILE_OVERLAY }} />
      <div className="absolute inset-0 hidden md:block" style={{ background: BANNER_HEADER_OVERLAY }} />

      {/* On the content's left edge, so it lines up with the eyebrow and the title */}
      <BannerDecorativeSquares className="absolute left-4 top-4 z-base md:left-6 md:top-5" />

      {dismissible && (
        <DismissButton
          aria-label={`Dismiss the ${title} banner`}
          onClick={() => setIsDismissed(true)}
          className="absolute right-4 top-4 z-base"
          data-testid="DismissBannerButton"
        />
      )}

      <div className="relative flex min-h-[180px] flex-col justify-between gap-6 px-4 pb-6 pt-12 md:min-h-[200px] md:px-6 md:pb-6 md:pt-14">
        <div className="flex flex-col gap-6">
          <div className="flex max-w-[30rem] flex-col gap-2">
            {eyebrow && (
              <Span caps bold variant="body-s" className={cn(BANNER_EYEBROW_CLASSES, 'text-banner-label')}>
                {eyebrow}
              </Span>
            )}
            <Header caps variant="h1" className="text-3xl leading-10 text-banner-title">
              {title}
            </Header>
            {typeof description === 'string' ? (
              <Paragraph className="text-banner-body">{description}</Paragraph>
            ) : (
              description
            )}
          </div>
          {children}
        </div>
        {bottomRight && (
          // Sits on top of the artwork, so it carries its own backdrop to stay readable
          <div className="self-start rounded-sm bg-v3-bg-accent-100/70 px-3 py-1.5 backdrop-blur-sm md:self-end">
            {bottomRight}
          </div>
        )}
      </div>
    </div>
  )
}
