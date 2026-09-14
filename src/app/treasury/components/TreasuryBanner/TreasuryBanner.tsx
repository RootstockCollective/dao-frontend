'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'

export const TreasuryBanner = ({ className }: CommonComponentProps) => (
  <PageBanner
    dataTestId="TreasuryBanner"
    dismissible
    imageSrc="/images/treasury-banner-bg.webp"
    title="Treasury"
    className={className}
  />
)
