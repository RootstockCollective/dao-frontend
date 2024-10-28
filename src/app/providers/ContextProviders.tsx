'use client'
import { config } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { AlertProvider } from './AlertProvider'
import ErrorBoundary from '@/components/ErrorPage/ErrorBoundary'
import { FeatureFlagProvider } from '@/shared/context/FeatureFlagContext'

interface Props {
  children: ReactNode
}

export const ContextProviders = ({ children }: Props) => {
  const queryClient = new QueryClient()
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <FeatureFlagProvider>
            <AlertProvider>{children}</AlertProvider>
          </FeatureFlagProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}
