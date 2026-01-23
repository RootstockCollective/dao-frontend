import { initSentryIfEnabled } from '@/lib/sentry-server'

// NOTE: DSN is only used if NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING=true
// If the feature flag is disabled, Sentry will not initialize and this DSN will be ignored.
initSentryIfEnabled({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: 1,
  enableLogs: true,
  environment: process.env.NEXT_PUBLIC_ENV || 'unknown',
})
