'use client'
import { wagmiAdapterConfig, wagmiAdapter, currentEnvChain } from '@/config'
import { REOWN_METADATA_URL, REOWN_PROJECT_ID } from '@/lib/constants'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { WagmiProvider, State } from 'wagmi'
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
  initialState?: State
}

// Set up metadata
const metadata = {
  name: 'Rootstock Collective',
  description: 'AppKit for the Rootstock Collective',
  url: REOWN_METADATA_URL,
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
}

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId: REOWN_PROJECT_ID,
  networks: [currentEnvChain],
  defaultNetwork: currentEnvChain,
  metadata: metadata,
  enableWalletConnect: false,
  features: {
    analytics: true,
    email: false,
    socials: false,
    collapseWallets: true,
  },
})

export const ContextProviders = ({ children, initialState }: Props) => {
  const queryClient = new QueryClient()

  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiAdapterConfig} initialState={initialState}>
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
