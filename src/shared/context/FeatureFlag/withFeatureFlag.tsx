'use client'

import { useRouter } from 'next/navigation'
import { ComponentType, FC } from 'react'
import { useFeatureFlags } from './FeatureFlagContext'
import { DEFAULT_CONFIG, FeatureHandleConfig } from './withServerFeatureFlag'

export const withFeatureFlag = <P extends object>(
  WrappedComponent: ComponentType<P>,
  config: FeatureHandleConfig,
) => {
  const { feature, fallback, redirectTo }: FeatureHandleConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const WithFeatureFlag: FC<P> = props => {
    const { flags } = useFeatureFlags()
    const router = useRouter()

    if (!flags[feature]) {
      if (redirectTo) {
        router.push(redirectTo)
      }

      return fallback
    }

    return <WrappedComponent {...props} />
  }

  WithFeatureFlag.displayName = `WithFeatureFlag(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithFeatureFlag
}
