import * as Sentry from '@sentry/nextjs'
import type { ParameterizedString, Log } from '@sentry/core'
import { getEnvFlag } from '@/shared/context/FeatureFlag/flags.utils'

const SENTRY_FEATURE_FLAG: 'sentry_error_tracking' = 'sentry_error_tracking'

export function isSentryEnabled(): boolean {
  return getEnvFlag(SENTRY_FEATURE_FLAG) ?? false
}

export function createSentryWrapper() {
  return {
    captureException: (error: Error, options?: Sentry.CaptureContext) => {
      if (!isSentryEnabled()) {
        console.warn('[Sentry disabled] Would have captured exception:', error.message)
        return ''
      }
      return Sentry.captureException(error, options)
    },

    captureMessage: (message: string, level?: Sentry.SeverityLevel) => {
      if (!isSentryEnabled()) {
        console.warn('[Sentry disabled] Would have captured message:', message)
        return ''
      }
      return Sentry.captureMessage(message, level)
    },

    logger: {
      info: (
        message: ParameterizedString,
        attributes?: Log['attributes'],
        metadata?: { scope?: Sentry.Scope },
      ) => {
        if (!isSentryEnabled()) {
          console.log('[Sentry disabled]', message, attributes)
          return
        }
        Sentry.logger.info(message, attributes, metadata)
      },
      warn: (
        message: ParameterizedString,
        attributes?: Log['attributes'],
        metadata?: { scope?: Sentry.Scope },
      ) => {
        if (!isSentryEnabled()) {
          console.warn('[Sentry disabled]', message, attributes)
          return
        }
        Sentry.logger.warn(message, attributes, metadata)
      },
      error: (
        message: ParameterizedString,
        attributes?: Log['attributes'],
        metadata?: { scope?: Sentry.Scope },
      ) => {
        if (!isSentryEnabled()) {
          console.error('[Sentry disabled]', message, attributes)
          return
        }
        Sentry.logger.error(message, attributes, metadata)
      },
    },
  }
}

export function createInitSentryIfEnabled<
  T extends Sentry.BrowserOptions | Sentry.NodeOptions | Sentry.EdgeOptions,
>() {
  return function initSentryIfEnabled(config: T): void {
    if (!isSentryEnabled()) {
      console.log('[Sentry] Error tracking disabled via feature flag')
      return
    }
    Sentry.init(config)
  }
}
