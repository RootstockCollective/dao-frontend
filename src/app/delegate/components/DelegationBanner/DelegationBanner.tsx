'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'

export const DelegationBanner = ({ className }: CommonComponentProps) => (
  <PageBanner
    dataTestId="DelegationBanner"
    dismissible
    imageSrc="/images/delegation-banner-bg.webp"
    title="Delegation"
    className={className}
  />
)
