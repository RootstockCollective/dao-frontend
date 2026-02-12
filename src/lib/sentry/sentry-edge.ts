import * as Sentry from '@sentry/nextjs'
import { createInitSentryIfEnabled } from './sentry-common'

export const initSentryIfEnabled = createInitSentryIfEnabled<Sentry.EdgeOptions>()
