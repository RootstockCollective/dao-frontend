'use client'
import { getConfig } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren, useState } from 'react'
import { WagmiProvider, State } from 'wagmi'
import { AlertProvider } from './AlertProvider'

interface Props extends PropsWithChildren {
  initialState: State | undefined
}

export const ContextProviders = ({ children, initialState }: Props) => {
  // https://wagmi.sh/react/guides/ssr
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>{children}</AlertProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
