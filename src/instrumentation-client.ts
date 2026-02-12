import { initSentryIfEnabled } from '@/lib/sentry/sentry-client'
import * as Sentry from '@sentry/nextjs'

// NOTE: DSN is only used if NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING=true
// If the feature flag is disabled, Sentry will not initialize and this DSN will be ignored.
initSentryIfEnabled({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  integrations: [Sentry.replayIntegration(), Sentry.browserTracingIntegration()],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NEXT_PUBLIC_ENV || 'unknown',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
