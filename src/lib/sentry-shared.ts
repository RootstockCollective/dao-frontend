import { getEnvFlag } from '@/shared/context/FeatureFlag/flags.utils'

const SENTRY_FEATURE_FLAG: 'sentry_error_tracking' = 'sentry_error_tracking'

export function isSentryEnabled(): boolean {
  return getEnvFlag(SENTRY_FEATURE_FLAG) ?? false
}
