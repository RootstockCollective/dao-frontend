import * as Sentry from '@sentry/nextjs'
import { createSentryWrapper, createInitSentryIfEnabled } from './sentry-common'

export const sentryServer = createSentryWrapper()

export const initSentryIfEnabled = createInitSentryIfEnabled<Sentry.NodeOptions>()
