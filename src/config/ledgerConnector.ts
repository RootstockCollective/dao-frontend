import { createConnector } from 'wagmi'
import { Chain, Address, UserRejectedRequestError, SwitchChainError } from 'viem'

export interface LedgerConnectorOptions {
  chainId?: number
}

interface LedgerConnectorState {
  provider: any | null
  account: Address | null
}

export function ledgerConnector(options: LedgerConnectorOptions = {}) {
  let state: LedgerConnectorState = {
    provider: null,
    account: null,
  }

  return createConnector<unknown>(config => {
    return {
      id: 'ledger',
      name: 'Ledger',
      type: 'hardware',

      async connect() {
        try {
          // Only import and use LedgerProvider on the client side
          if (typeof window === 'undefined') {
            throw new Error('Ledger connection only available in browser environment')
          }

          const chainId = options?.chainId || config.chains[0]?.id || 1
          const rpcUrl = config.chains[0].rpcUrls.default.http[0]

          // Dynamic import to avoid SSR issues
          const { LedgerProvider } = await import('@rsksmart/rlogin-ledger-provider')

          // Create the RLogin Ledger provider
          state.provider = new LedgerProvider({
            chainId,
            rpcUrl,
            debug: false,
            dPath: "44'/60'/0'/0/0", // Force standard Ethereum derivation path
          })

          // Connect to the Ledger device
          await state.provider.connect()

          // Get the address through the provider's accounts
          const accounts = (await state.provider.request({
            method: 'eth_accounts',
            params: [],
          })) as string[]

          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found on Ledger device')
          }

          const address = accounts[0] as Address
          state.account = address

          // Emit connection event
          config.emitter.emit('change', {
            accounts: [address],
            chainId,
          })

          return {
            accounts: [address],
            chainId,
          }
        } catch (error) {
          // Add more specific error handling
          if (error instanceof Error) {
            if (error.message.includes('0x6a15')) {
              throw new Error('Ledger device: Please unlock your device and open the Ethereum app')
            }

            if (error.message.includes('Permission')) {
              throw new Error('Browser permission denied. Please allow USB access and try again.')
            }

            if (error.message.includes('not supported')) {
              throw new Error(
                'Your browser does not support hardware wallet connections. Please use Chrome, Edge, or Opera.',
              )
            }
          }

          if (isUserRejectedRequestError(error)) {
            throw new UserRejectedRequestError(error as Error)
          }
          throw error
        }
      },

      async disconnect() {
        try {
          if (state.provider) {
            await state.provider.disconnect()
          }
        } catch (error) {
          // Silent cleanup
        } finally {
          state.provider = null
          state.account = null
          // Emit disconnect event to ensure proper cleanup
          config.emitter.emit('disconnect')
        }
      },

      async getAccounts() {
        if (!state.account) {
          return []
        }
        return [state.account]
      },

      async getChainId() {
        const chainId = options?.chainId || config.chains[0]?.id || 1
        return chainId
      },

      async getProvider() {
        if (!state.provider) {
          throw new Error('Ledger not connected')
        }

        const chainId = await this.getChainId()

        return {
          request: async ({ method, params }: { method: string; params?: any[] }) => {
            if (!state.provider) {
              throw new Error('Ledger not connected')
            }

            switch (method) {
              case 'eth_requestAccounts':
                const accounts = await this.getAccounts()
                config.emitter.emit('change', {
                  accounts,
                  chainId,
                })
                return accounts
              case 'eth_accounts':
                return state.account ? [state.account] : []
              case 'eth_chainId':
                const hexChainId = `0x${chainId.toString(16)}`
                return hexChainId
              case 'personal_sign':
                return state.provider.personalSign(params as any)
              case 'eth_signTypedData_v4':
                // RLogin provider doesn't have typed data signing, so we'll fall back to personal sign
                return state.provider.personalSign([params?.[1], params?.[0]] as any)
              case 'eth_sendTransaction':
                if (!params?.[0]) throw new Error('Transaction params required')
                return state.provider.ethSendTransaction(params as any)
              default:
                // For other methods, delegate to the underlying provider
                return state.provider.request({ method, params })
            }
          },
        }
      },

      async isAuthorized() {
        try {
          // Only check authorization on the client side
          if (typeof window === 'undefined') {
            return false
          }
          return !!(state.provider && state.account)
        } catch {
          return false
        }
      },

      async switchChain({ chainId }) {
        const chain = config.chains.find(c => c.id === chainId)
        if (!chain) {
          throw new SwitchChainError(new Error(`Chain ${chainId} not configured`))
        }

        // Update the connector's chain
        config.emitter.emit('change', { chainId })
        return chain
      },

      onAccountsChanged(accounts: string[]) {
        if (accounts.length === 0) {
          config.emitter.emit('disconnect')
        } else {
          config.emitter.emit('change', { accounts: accounts as readonly Address[] })
        }
      },

      onChainChanged(chainId: string | number) {
        const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId
        config.emitter.emit('change', { chainId: id })
      },

      onDisconnect() {
        config.emitter.emit('disconnect')
      },
    }
  })

  function isUserRejectedRequestError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('User rejected') ||
        error.message.includes('Denied by user') ||
        error.message.includes('User denied'))
    )
  }
}
