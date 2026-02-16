import * as Sentry from '@sentry/nextjs'
import { getEnvFlag } from '@/shared/context/FeatureFlag/flags.utils'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

const SENTRY_FEATURE_FLAG: 'sentry_error_tracking' = 'sentry_error_tracking'

export const onRequestError = (error: Error, request: Request) => {
  const isSentryEnabled = getEnvFlag(SENTRY_FEATURE_FLAG) ?? false
  if (!isSentryEnabled) {
    console.warn('[Sentry disabled] Would have captured request error:', error.message)
    return
  }
  const requestInfo = {
    path: request.url || '',
    method: request.method || 'GET',
    headers: Object.fromEntries(request.headers.entries()),
  }
  const errorContext = {
    routerKind: 'App Router',
    routePath: request.url || '',
    routeType: 'route',
  }
  return Sentry.captureRequestError(error, requestInfo, errorContext)
}
