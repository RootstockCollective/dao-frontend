import { ReactNode } from 'react'

import { MoltenBackground } from '@/components/MoltenBackground'
import { Header, Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { BANNER_HEADER_OVERLAY, BANNER_MOBILE_OVERLAY, PAGE_TITLE_CLASSES } from './bannerAssets'

export interface PageBannerProps {
  title: string
  /** Optional intro copy. Omit it for banners that only carry the page title. */
  description?: ReactNode
  /** Rendered at the bottom right of the banner, typically an external link. */
  bottomRight?: ReactNode
  /** Rendered under the description, typically a call to action and/or metrics. */
  children?: ReactNode
  className?: string
  dataTestId?: string
}

/**
 * Page hero: the still molten background shared by every page, title, intro copy and
 * optional call to action. A banner that only carries the title uses a compact layout.
 */
export const PageBanner = ({
  title,
  description,
  bottomRight,
  children,
  className,
  dataTestId = 'PageBanner',
}: PageBannerProps) => {
  const isTitleOnly = !description && !bottomRight && !children

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

      <div
        className={cn(
          'relative flex flex-col gap-6 px-4 md:px-6',
          isTitleOnly
            ? 'min-h-[72px] justify-center py-4 md:min-h-[80px] md:py-5'
            : 'min-h-[180px] justify-between py-6 md:min-h-[200px] md:py-8',
        )}
        data-compact={isTitleOnly}
      >
        <div className="flex flex-col gap-6">
          <div className="flex max-w-[30rem] flex-col gap-2">
            <Header caps variant="h1" className={cn(PAGE_TITLE_CLASSES, 'text-banner-title')}>
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
