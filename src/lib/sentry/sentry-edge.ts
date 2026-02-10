import * as Sentry from '@sentry/nextjs'
import { isSentryEnabled } from './sentry-shared'

export function initSentryIfEnabled(config: Sentry.EdgeOptions): void {
  if (!isSentryEnabled()) {
    console.log('[Sentry] Error tracking disabled via feature flag')
    return
  }
  Sentry.init(config)
}
