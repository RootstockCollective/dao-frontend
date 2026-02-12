import * as Sentry from '@sentry/nextjs'
import type { StartSpanOptions } from '@sentry/core'
import { createSentryWrapper, createInitSentryIfEnabled, isSentryEnabled } from './sentry-common'

const baseWrapper = createSentryWrapper()

export const sentryClient = {
  ...baseWrapper,

  startSpan: <T>(options: StartSpanOptions, callback: (span: Sentry.Span) => T) => {
    if (!isSentryEnabled()) {
      return callback({} as Sentry.Span)
    }
    return Sentry.startSpan(options, callback)
  },

  diagnoseSdkConnectivity: () => {
    if (!isSentryEnabled()) {
      return Promise.resolve('sentry-disabled' as const)
    }
    return Sentry.diagnoseSdkConnectivity()
  },
}

export const initSentryIfEnabled = createInitSentryIfEnabled<Sentry.BrowserOptions>()
