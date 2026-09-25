'use client'

import { CRWhitepaperLink } from '@/app/collective-rewards/shared/components/CRWhitepaperLinkNew'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'
import { Span } from '@/components/Typography'

const BANNER_IMAGE_SRC = '/images/my-rewards-banner.webp'

export const MyRewardsBanner = ({ className }: CommonComponentProps) => (
  <PageBanner
    dataTestId="MyRewardsBanner"
    dismissible
    imageSrc={BANNER_IMAGE_SRC}
    title="My Rewards"
    description="Track and claim the rewards you earn from backing Collective Rewards Builders. Claim and restake for higher rewards and voting power."
    bottomRight={
      <Span>
        See the <CRWhitepaperLink>Whitepaper</CRWhitepaperLink>
      </Span>
    }
    className={className}
  />
)
