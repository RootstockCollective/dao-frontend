import { redirect } from 'next/navigation'
import type { ComponentType, FC } from 'react'
import { type FeatureFlag, getEnvFlag } from './flags.utils'

export interface FeatureHandleConfig {
  feature: FeatureFlag
  fallback?: React.ReactNode
  redirectTo?: string
}

const DefaultFallback: FC = () => <></>

export const DEFAULT_CONFIG: Partial<FeatureHandleConfig> = {
  fallback: <DefaultFallback />,
}

export const withServerFeatureFlag = <P extends object>(
  WrappedComponent: ComponentType<P>,
  config: FeatureHandleConfig,
) => {
  const { feature, fallback, redirectTo }: FeatureHandleConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const WithServerFeatureFlag: FC<P> = props => {
    if (!(getEnvFlag(feature) ?? false)) {
      if (redirectTo) {
        redirect(redirectTo)
      }

      return fallback
    }

    return <WrappedComponent {...props} />
  }

  WithServerFeatureFlag.displayName = `WithServerFeatureFlag(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithServerFeatureFlag
}
