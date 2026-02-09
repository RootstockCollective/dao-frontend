import { useEffect } from 'react'
import { showToast } from '@/shared/notification'
import { sentryClient } from '@/lib/sentry/sentry-client'

interface ErrorHandlerParams {
  title: string
  error?: Error | null
  content?: string
}

type ErrorHandler = (params: ErrorHandlerParams) => void
export const useHandleErrors: ErrorHandler = ({ error, title, content }) => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DAO_DEV) return
    if (error) {
      showToast({
        severity: 'error',
        title,
        content: content ?? error.message,
      })
      console.error(`🐛 ${title}:`, error)
      sentryClient.captureException(error, {
        tags: {
          errorType: 'COLLECTIVE_REWARDS_ERROR',
          title,
        },
        extra: {
          title,
          content: content ?? error.message,
        },
      })
    }
  }, [error, title, content])
}
