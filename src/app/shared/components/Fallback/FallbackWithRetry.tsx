import { ReactNode, useEffect } from 'react'
import { FallbackProps } from 'react-error-boundary'

type FallbackWithRetryProps = FallbackProps & {
  retryDelayMs: number
  children: ReactNode
}

const FallbackWithRetry = ({ resetErrorBoundary, children, retryDelayMs }: FallbackWithRetryProps) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      resetErrorBoundary()
    }, retryDelayMs)

    return () => clearTimeout(timeout)
  }, [resetErrorBoundary, retryDelayMs])

  return <>{children}</>
}

export const withFallbackRetry = (fallbackContent: ReactNode, retryDelayMs: number = 5 * 60 * 1000) => {
  const WrappedComponent = (props: FallbackProps) => (
    <FallbackWithRetry {...props} retryDelayMs={retryDelayMs}>
      {fallbackContent}
    </FallbackWithRetry>
  )

  WrappedComponent.displayName = 'WithFallbackRetry'

  return WrappedComponent
}
