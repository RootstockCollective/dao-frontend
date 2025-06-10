import { createConnector } from 'wagmi'
import type { TrezorConnectorOptions } from './types'
import { TrezorHardwareWallet } from './trezor-hardware-wallet'

/**
 * Creates a Wagmi connector for Trezor hardware wallet
 * @param options - Configuration options for the Trezor connector
 * @returns A Wagmi connector for Trezor
 */
export function trezorWalletConnector(options: TrezorConnectorOptions = {}) {
  // Use createConnector from wagmi to create the connector
  return createConnector(config => {
    // Extract chain information from Wagmi config
    const defaultChainId = config.chains[0]?.id

    // Convert chain RPC URLs to a simple object format
    const rpcUrls: Record<number, string> = {}
    config.chains.forEach(chain => {
      const httpUrl = chain.rpcUrls.default.http[0]
      if (httpUrl) {
        rpcUrls[chain.id] = httpUrl
      }
    })

    // Create the hardware wallet instance
    const trezorWallet = new TrezorHardwareWallet({
      email: options.email || 'francis.rodriguez@rootstocklabs.com', // @TODO Replace with default email
      appUrl:
        options.appUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
      derivationPath: options.derivationPath || "m/44'/60'/0'/0/0",
      defaultChainId,
      rpcUrls,
    })

    // Return Wagmi connector interface with methods mapped to the wallet instance
    return {
      id: 'trezor',
      name: 'Trezor',
      type: 'hardware' as const,
      icon: TrezorHardwareWallet.PROVIDER_INFO.icon,

      // Map methods to the hardware wallet implementation
      setup: () => trezorWallet.setup(),
      connect: (params: { chainId?: number } = {}) => trezorWallet.connect(params),
      disconnect: () => trezorWallet.disconnect(),
      getAccounts: () => trezorWallet.getAccounts(),
      getChainId: () => trezorWallet.getChainId(),
      getProvider: () => trezorWallet.getProvider(),
      isAuthorized: () => trezorWallet.isAuthorized(),
      switchChain: (params: { chainId: number }) => trezorWallet.switchChain(params),

      // Event handlers
      onAccountsChanged: () => trezorWallet.onAccountsChanged(),
      onChainChanged: () => trezorWallet.onChainChanged(),
      onConnect: () => trezorWallet.onConnect(),
      onDisconnect: () => trezorWallet.onDisconnect(),
    }
  })
}
