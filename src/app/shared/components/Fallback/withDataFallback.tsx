import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { withFallbackRetry } from './FallbackWithRetry'

interface DataLoaderProps<T> {
  render: (args: { data: T; isLoading: boolean }) => ReactNode
}

export function withDataFallback<T>(
  usePrimary: () => { data: T; isLoading: boolean; error?: unknown },
  useFallback: () => { data: T; isLoading: boolean; error?: unknown },
) {
  // Declared once per loader rather than inside DataLoader: a component defined during render is a
  // new type every time, which remounts it (and restarts its queries) on each parent render
  const PrimaryLoader = ({ render }: DataLoaderProps<T>) => {
    const { data, isLoading, error } = usePrimary()
    if (error) throw error
    return <>{render({ data, isLoading })}</>
  }

  const FallbackLoader = ({ render }: DataLoaderProps<T>) => {
    const { data, isLoading } = useFallback()
    return <>{render({ data, isLoading })}</>
  }

  const DataLoader = ({ render }: DataLoaderProps<T>) => (
    <ErrorBoundary fallbackRender={withFallbackRetry(<FallbackLoader render={render} />)}>
      <PrimaryLoader render={render} />
    </ErrorBoundary>
  )

  DataLoader.displayName = 'WithDataFallback'

  return DataLoader
}
