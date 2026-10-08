'use client'

import { CRWhitepaperLink } from '@/app/collective-rewards/shared/components/CRWhitepaperLinkNew'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'
import { Span } from '@/components/Typography'

export const MyRewardsBanner = ({ className }: CommonComponentProps) => (
  <PageBanner
    dataTestId="MyRewardsBanner"
    dismissible
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
