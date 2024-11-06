import { useEffect } from 'react'
import { useAlertContext } from '@/app/providers'

export const useHandleErrors = (errors: { error: Error | null; title: string }[]) => {
  const { setMessage } = useAlertContext()

  useEffect(() => {
    errors.forEach(({ error, title }) => {
      if (error) {
        setMessage({
          severity: 'error',
          title,
          content: error.message,
        })
        console.error(`🐛 ${title}:`, error)
      }
    })
  }, [errors, setMessage])
}
