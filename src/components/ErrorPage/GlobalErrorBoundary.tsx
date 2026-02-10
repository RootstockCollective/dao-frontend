import { ReactNode, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { cn } from '@/lib/utils'
import { BG_IMG_CLASSES } from '@/shared/utils'
import { HeaderText } from '@/components/HeaderText/HeaderText'
import { Button } from '@/components/Button'
import {
  checkForCommonErrors,
  isChunkLoadError,
  attemptChunkReloadRecovery,
  shouldAttemptChunkRecovery,
  clearChunkReloadAttempts,
} from './commonErrors'
import { Header, Paragraph } from '../Typography'
import { sentryClient } from '@/lib/sentry/sentry-wrapper'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [isRecovering, setIsRecovering] = useState(false)
  const isChunkError = isChunkLoadError(error)
  const canAutoRecover = isChunkError && shouldAttemptChunkRecovery()

  // Attempt automatic recovery for ChunkLoadError
  useEffect(() => {
    if (canAutoRecover && !isRecovering) {
      setIsRecovering(true)
      // Small delay to show the user what's happening
      const timer = setTimeout(() => {
        attemptChunkReloadRecovery()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [canAutoRecover, isRecovering])

  const errorString = checkForCommonErrors(error)

  const handleRetry = () => {
    if (isChunkError) {
      // For chunk errors, always do a hard reload to get fresh chunks
      clearChunkReloadAttempts()
      window.location.reload()
    } else {
      // For other errors, try resetting the error boundary first
      resetErrorBoundary()
    }
  }

  const handleGoHome = () => {
    clearChunkReloadAttempts()
    window.location.href = '/'
  }

  // Show loading state while attempting automatic recovery
  if (isRecovering && canAutoRecover) {
    return (
      <div
        className={cn(BG_IMG_CLASSES, 'w-screen h-screen flex flex-row justify-start items-center bg-black')}
      >
        <div className="w-1/2 flex flex-col items-center">
          <HeaderText />
          <Header variant="e1" className="text-4xl mb-6">
            UPDATING...
          </Header>
          <Paragraph className="mb-8">
            A new version is available. Reloading to get the latest updates...
          </Paragraph>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(BG_IMG_CLASSES, 'w-screen h-screen flex flex-row justify-start items-center bg-black')}
    >
      <div className="w-1/2 flex flex-col items-center">
        <HeaderText />
        <Header variant="e1" className="text-7xl mb-6">
          ERROR OCCURRED
        </Header>
        <Paragraph className="mb-8">{errorString}</Paragraph>
        <div className="flex gap-4">
          <Button variant="primary" onClick={handleRetry}>
            {isChunkError ? 'Reload page' : 'Try again'}
          </Button>
          {isChunkError && (
            <Button variant="secondary" onClick={handleGoHome}>
              Go to home
            </Button>
          )}
        </div>
        {isChunkError && (
          <Paragraph className="mt-4 text-sm opacity-70">
            This can happen when the app is updated. A page reload usually fixes it.
          </Paragraph>
        )}
      </div>
    </div>
  )
}

interface Props {
  children: ReactNode
}

export const GlobalErrorBoundary = ({ children }: Props) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Error caught by Custom Error Boundary:', error, info)

        // Log additional context for ChunkLoadError to help debugging
        if (isChunkLoadError(error)) {
          console.warn(
            'ChunkLoadError detected. This typically occurs after a deployment when old chunks are no longer available.',
            {
              url: typeof window !== 'undefined' ? window.location.href : 'N/A',
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
            },
          )
        }
        sentryClient.captureException(error, {
          contexts: {
            react: {
              componentStack: info.componentStack,
            },
          },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
