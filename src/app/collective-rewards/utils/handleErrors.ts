import { useEffect } from 'react'
import { useAlertContext } from '@/app/providers'

type ErrorHandler = (params: { error: Error | null; title: string }) => void
export const useHandleErrors: ErrorHandler = ({ error, title }) => {
  const { setMessage } = useAlertContext()

  useEffect(() => {
    if (error) {
      setMessage({
        severity: 'error',
        title,
        content: error.message,
      })
      console.error(`🐛 ${title}:`, error)
    }
  }, [error, title, setMessage])
}
