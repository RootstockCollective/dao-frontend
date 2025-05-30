import type { FC, PropsWithChildren } from 'react'
import { type FeatureFlag, getEnvFlag } from './flags.utils'

export type FeaturePageProps = PropsWithChildren & {
  feature: FeatureFlag
  fallback?: React.ReactNode
}

export const DefaultFallback: FC = () => <div>Feature not available</div>

export const withFeatureFlagRSC: FC<FeaturePageProps> = ({
  feature,
  children,
  fallback = <DefaultFallback />,
}) => {
  if (!getEnvFlag(feature)) {
    return fallback
  }

  return children
}
