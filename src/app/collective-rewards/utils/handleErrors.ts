import { useEffect } from 'react'
import { showToast } from '@/shared/notification'

type ErrorHandler = (params: { error?: Error | null; title: string; content?: string }) => void
export const useHandleErrors: ErrorHandler = ({ error, title, content }) => {
  useEffect(() => {
    if (error) {
      showToast({
        severity: 'error',
        title,
        content: content ?? error.message,
      })
      console.error(`🐛 ${title}:`, error)
    }
  }, [error, title, content])
}
