'use client'
import { config } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { AlertProvider } from './AlertProvider'
import ErrorBoundary from '@/components/ErrorPage/ErrorBoundary'
import { BuilderContextProviderWithPrices } from '../collective-rewards/user'
import { AllocationsContextProvider } from '../collective-rewards/allocations/context'
import { BoosterProvider } from './NFT/BoosterContext'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { BalancesProvider } from '@/app/user/Balances/context/BalancesContext'
import { HeroCollapseProvider } from '@/app/user/HeroSection/HeroCollapseContext'

interface Props {
  children: ReactNode
}

export const ContextProviders = ({ children }: Props) => {
  const queryClient = new QueryClient()

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <AlertProvider>
            <HeroCollapseProvider>
              <BuilderContextProviderWithPrices>
                <BoosterProvider>
                  <AllocationsContextProvider>
                    <BalancesProvider>
                      <MainContainer>{children}</MainContainer>
                    </BalancesProvider>
                  </AllocationsContextProvider>
                </BoosterProvider>
              </BuilderContextProviderWithPrices>
            </HeroCollapseProvider>
          </AlertProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}
