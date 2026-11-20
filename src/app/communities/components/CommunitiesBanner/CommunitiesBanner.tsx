'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'

export const CommunitiesBanner = ({ className }: CommonComponentProps) => (
  <PageBanner dataTestId="CommunitiesBanner" title="Communities" className={className} />
)
