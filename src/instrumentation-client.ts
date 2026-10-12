import 'posthog-js/dist/dead-clicks-autocapture'
import 'posthog-js/dist/exception-autocapture'
import 'posthog-js/dist/web-vitals'

import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

import { POSTHOG_ENVIRONMENT } from '@/lib/posthog-environment'
import { initSentryIfEnabled } from '@/lib/sentry/sentry-client'
import { getEnvFlag } from '@/shared/context/FeatureFlag/flags.utils'

if (process.env.NODE_ENV === 'development') {
  import('react-grab')
}

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
  // Extensions come from the imports above; enabling another one remotely also needs its import here.
  disable_external_dependency_loading: true,
  disable_surveys: true,
  capture_exceptions: true,
  debug: process.env.NEXT_PUBLIC_PROFILE === 'dev',
  loaded: ph => {
    ph.register({ environment: POSTHOG_ENVIRONMENT })
  },
})
