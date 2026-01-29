'use client'

import { useEffect } from 'react'
import {
  isChunkLoadError,
  attemptChunkReloadRecovery,
  shouldAttemptChunkRecovery,
  clearChunkReloadAttempts,
} from '@/components/ErrorPage/commonErrors'

/**
 * Hook that sets up global error handlers to catch ChunkLoadError events
 * that might occur during dynamic imports and navigation.
 *
 * This complements the ErrorBoundary by catching errors that happen
 * outside of React's render cycle (e.g., during route navigation).
 */
export function useChunkErrorHandler() {
  useEffect(() => {
    // Clear reload attempts on successful page load
    // This ensures the counter resets after a successful recovery
    clearChunkReloadAttempts()

    const handleError = (event: ErrorEvent) => {
      const error = event.error
      if (error && isChunkLoadError(error)) {
        console.warn('ChunkLoadError caught by global handler:', error.message)

        // Prevent the default error handling
        event.preventDefault()

        // Attempt automatic recovery
        if (shouldAttemptChunkRecovery()) {
          attemptChunkReloadRecovery()
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      if (error instanceof Error && isChunkLoadError(error)) {
        console.warn('ChunkLoadError caught by unhandled rejection handler:', error.message)

        // Prevent the default error handling
        event.preventDefault()

        // Attempt automatic recovery
        if (shouldAttemptChunkRecovery()) {
          attemptChunkReloadRecovery()
        }
      }
    }

    // Add global error handlers
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}
