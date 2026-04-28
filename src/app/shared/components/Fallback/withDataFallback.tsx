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
  const DataLoader = ({ render }: DataLoaderProps<T>) => {
    const PrimaryLoader = () => {
      const { data, isLoading, error } = usePrimary()
      if (error) throw error
      return <>{render({ data, isLoading })}</>
    }

    const FallbackLoader = () => {
      const { data, isLoading } = useFallback()
      return <>{render({ data, isLoading })}</>
    }

    return (
      <ErrorBoundary fallbackRender={withFallbackRetry(<FallbackLoader />)}>
        <PrimaryLoader />
      </ErrorBoundary>
    )
  }

  DataLoader.displayName = 'WithDataFallback'

  return DataLoader
}
