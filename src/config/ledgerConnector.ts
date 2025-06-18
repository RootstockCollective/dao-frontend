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

  console.log('RLogin Ledger connector initialized with options:', options)

  return createConnector<unknown>(config => {
    console.log(
      'RLogin Ledger connector config chains:',
      config.chains.map(c => ({ id: c.id, name: c.name })),
    )

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

          console.log('Connecting to Ledger with:', { chainId, rpcUrl })

          // Check browser permissions first
          console.log('🔍 Checking browser capabilities...')
          console.log('navigator.hid available:', !!(navigator as any).hid)
          console.log('navigator.usb available:', !!(navigator as any).usb)

          // Dynamic import to avoid SSR issues
          const { LedgerProvider } = await import('@rsksmart/rlogin-ledger-provider')

          // Create the RLogin Ledger provider with additional debugging
          console.log('🔧 Creating LedgerProvider with config:', {
            chainId,
            rpcUrl,
            debug: true
          })

          state.provider = new LedgerProvider({
            chainId,
            rpcUrl,
            debug: true, // Enable debug logging
            dPath: "44'/60'/0'/0/0", // Force standard Ethereum derivation path
          })

          // Connect to the Ledger device
          console.log('🔌 Attempting to connect to Ledger device...')
          
          // First, let's try a direct transport test to diagnose the issue
          try {
            console.log('🧪 Testing direct Ledger transport connection...')
            const TransportWebHID = (await import('@ledgerhq/hw-transport-webhid')).default
            const TransportWebUSB = (await import('@ledgerhq/hw-transport-webusb')).default
            
            let transport
            try {
              if (await TransportWebHID.isSupported()) {
                console.log('📱 Trying WebHID transport...')
                transport = await TransportWebHID.create()
              } else if (await TransportWebUSB.isSupported()) {
                console.log('📱 Trying WebUSB transport...')
                transport = await TransportWebUSB.create()
              }
              
              if (transport) {
                console.log('✅ Direct transport connection successful!')
                await transport.close()
              }
            } catch (directError) {
              console.log('❌ Direct transport test failed:', directError)
            }
          } catch (importError) {
            console.log('⚠️ Could not import transport for testing:', importError)
          }
          
          await state.provider.connect()

          // Get the address through the provider's accounts
          console.log('📍 Getting account addresses...')
          const accounts = (await state.provider.request({
            method: 'eth_accounts',
            params: [],
          })) as string[]
          
          console.log('📍 Retrieved accounts:', accounts)
          
          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found on Ledger device')
          }

          const address = accounts[0] as Address
          state.account = address

          console.log('Successfully connected to Ledger:', { address, chainId })

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
          console.error('Ledger connection error:', error)
          
          // Add more specific error handling
          if (error instanceof Error) {
            if (error.message.includes('0x6a15')) {
              console.error('❌ Ledger Error: Please make sure:')
              console.error('   1. Ledger device is unlocked')
              console.error('   2. Ethereum app is open and ready')
              console.error('   3. Browser has USB/HID permissions')
              throw new Error('Ledger device: Please unlock your device and open the Ethereum app')
            }
            
            if (error.message.includes('Permission')) {
              console.error('❌ Browser Permission Error: Please allow USB access when prompted')
              throw new Error('Browser permission denied. Please allow USB access and try again.')
            }
            
            if (error.message.includes('not supported')) {
              console.error('❌ Browser Compatibility Error: WebHID/WebUSB not supported')
              throw new Error('Your browser does not support hardware wallet connections. Please use Chrome, Edge, or Opera.')
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
          console.warn('Error disconnecting Ledger:', error)
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
        console.log('getChainId called - returning:', chainId)
        return chainId
      },

      async getProvider() {
        if (!state.provider) {
          throw new Error('Ledger not connected')
        }

        const chainId = await this.getChainId()
        console.log('getProvider - using chainId:', chainId)

        return {
          request: async ({ method, params }: { method: string; params?: any[] }) => {
            console.log(`RLogin Provider request: ${method}`, { params, chainId })

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
                console.log('eth_chainId returning:', hexChainId, 'for chainId:', chainId)
                return hexChainId
              case 'personal_sign':
                return state.provider.personalSign(params as any)
              case 'eth_signTypedData_v4':
                // RLogin provider doesn't have typed data signing, so we'll fall back to personal sign
                console.warn(
                  'eth_signTypedData_v4 not supported by RLogin provider, falling back to personal_sign',
                )
                return state.provider.personalSign([params?.[1], params?.[0]] as any)
              case 'eth_sendTransaction':
                if (!params?.[0]) throw new Error('Transaction params required')
                console.log('eth_sendTransaction called with params:', params[0])
                console.log('eth_sendTransaction using chainId:', chainId)
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
