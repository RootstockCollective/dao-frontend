import { useEffect } from 'react'
import { showToast } from '@/shared/notification'

const handleError = ({ error, title, content }: ErrorParams) => {
  if (error && error instanceof Error) {
    showToast({
      severity: 'error',
      title,
      content: content ?? error?.message,
    })
    console.error(`🐛 ${title}:`, error)
  }
}

type ErrorParams = { error?: Error | null; title: string; content?: string }
type ErrorHandler = (params: ErrorParams | ErrorParams[]) => void

export const useHandleErrors: ErrorHandler = params => {
  useEffect(() => {
    if (params instanceof Array) {
      return params.forEach(handleError)
    }

    return handleError(params)
  }, [params])
}
