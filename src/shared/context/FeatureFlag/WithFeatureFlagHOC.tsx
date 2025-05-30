'use client'

import type { FC } from 'react'
import { useFeatureFlags } from '.'
import { DefaultFallback, FeaturePageProps } from './withFeatureFlagRSC'

export const WithFeatureFlagHOC: FC<FeaturePageProps> = ({
  feature,
  children,
  fallback = <DefaultFallback />,
}) => {
  const { flags } = useFeatureFlags()

  if (!flags[feature]) {
    return fallback
  }

  return children
}
