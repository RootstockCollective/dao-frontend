'use client'

import { useAccount } from 'wagmi'

import { WalletNotConnectedSection } from '@/components/WalletNotConnectedSection'

import { WALLET_NOT_CONNECTED_SUBTITLE, WALLET_NOT_CONNECTED_TITLE } from '../constants'

/**
 * Renders the wallet-not-connected section at the bottom of the BTC Vault page
 * when the user's wallet is disconnected. Otherwise renders null.
 */
export const BtcVaultWalletDisconnectedSection = () => {
  const { isConnected } = useAccount()

  if (isConnected) {
    return null
  }

  return (
    <section className="w-full" data-testid="BtcVaultWalletDisconnectedSection">
      <WalletNotConnectedSection
        title={WALLET_NOT_CONNECTED_TITLE}
        subtitle={WALLET_NOT_CONNECTED_SUBTITLE}
      />
    </section>
  )
}
