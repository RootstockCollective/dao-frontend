import * as Sentry from '@sentry/nextjs'

import { createInitSentryIfEnabled, createSentryWrapper } from './sentry-common'

export const sentryServer = createSentryWrapper()

export const initSentryIfEnabled = createInitSentryIfEnabled<Sentry.NodeOptions>()
