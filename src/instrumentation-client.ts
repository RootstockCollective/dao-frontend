import { initSentryIfEnabled } from '@/lib/sentry/sentry-client'
import * as Sentry from '@sentry/nextjs'
import { getEnvFlag } from '@/shared/context/FeatureFlag/flags.utils'

const enableReplay = getEnvFlag('sentry_replay') ?? false

initSentryIfEnabled({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  integrations: [Sentry.browserTracingIntegration(), ...(enableReplay ? [Sentry.replayIntegration()] : [])],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: enableReplay ? 0.1 : 0,
  replaysOnErrorSampleRate: enableReplay ? 1.0 : 0,
  environment: process.env.NEXT_PUBLIC_PROFILE || 'unknown',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
