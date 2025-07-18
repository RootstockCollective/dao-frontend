'use client'
import { BalancesProvider } from '@/app/user/Balances/context/BalancesContext'
import { HeroCollapseProvider } from '@/app/user/HeroSection/HeroCollapseContext'
import { GlobalErrorBoundary } from '@/components/ErrorPage/GlobalErrorBoundary'
import { currentEnvChain, wagmiAdapter, wagmiAdapterConfig } from '@/config'
import { REOWN_METADATA_URL, REOWN_PROJECT_ID } from '@/lib/constants'
import { FeatureFlagProvider } from '@/shared/context/FeatureFlag'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { State, WagmiProvider } from 'wagmi'
import { AllocationsContextProvider } from '../collective-rewards/allocations/context'
import { BuilderContextProviderWithPrices } from '../collective-rewards/user'
import { AlertProvider } from './AlertProvider'
import { BoosterProvider } from './NFT/BoosterContext'

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
  enableWalletConnect: true,
  allWallets: 'HIDE',
  // The `featuredWalletIds` array contains hashes representing specific wallet providers.
  // These hashes are used to identify and prioritize certain wallets in the UI.
  // Link for wallet IDs as of 2025-05-14 https://docs.reown.com/cloud/wallets/wallet-list
  featuredWalletIds: [
    // '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live(Currently disabled as it doesn't support RSK network)
    'ledger-hardware-wallet', // Ledger (direct)
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // Metamask
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // SafePal
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget
    '9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a', // SubWallet
    '0cb0c532b518aa842786d5167e13df22046bc9301b6677808d7134c3d7366a9d', // WigWam
    'io.trezor.hardware-wallet', // Add Trezor's EIP-6963 UUID
  ],
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook'],
    collapseWallets: true,
  },
})

export const ContextProviders = ({ children, initialState }: Props) => {
  const queryClient = new QueryClient()

  return (
    <GlobalErrorBoundary>
      <FeatureFlagProvider>
        <WagmiProvider config={wagmiAdapterConfig} initialState={initialState}>
          <QueryClientProvider client={queryClient}>
            <AlertProvider>
              <HeroCollapseProvider>
                <BuilderContextProviderWithPrices>
                  <BoosterProvider>
                    <AllocationsContextProvider>
                      <BalancesProvider>
                        <TooltipProvider>{children}</TooltipProvider>
                      </BalancesProvider>
                    </AllocationsContextProvider>
                  </BoosterProvider>
                </BuilderContextProviderWithPrices>
              </HeroCollapseProvider>
            </AlertProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </FeatureFlagProvider>
    </GlobalErrorBoundary>
  )
}
