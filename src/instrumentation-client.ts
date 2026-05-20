import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

import { initSentryIfEnabled } from '@/lib/sentry/sentry-client'
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

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
})
