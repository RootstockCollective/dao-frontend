'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'

export const DelegationBanner = ({ className }: CommonComponentProps) => (
  <PageBanner dataTestId="DelegationBanner" title="Delegation" className={className} />
)
