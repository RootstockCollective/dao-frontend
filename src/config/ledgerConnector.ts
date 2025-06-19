import { createConnector } from 'wagmi'
import { Chain, Address, UserRejectedRequestError, SwitchChainError } from 'viem'
import { showToast, ToastAlertOptions } from '@/shared/notification'

export interface LedgerConnectorOptions {
  chainId?: number
}

interface LedgerConnectorState {
  provider: any | null
  account: Address | null
  isConnecting: boolean
  lastConnectionAttempt: number | null
}

// EIP-6963 Provider Info for Ledger
const LEDGER_PROVIDER_INFO = {
  uuid: 'ledger-hardware-wallet',
  name: 'Ledger',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMEgxNlYxNkgwVjBaIiBmaWxsPSIjMDBEOEZGIi8+CjxwYXRoIGQ9Ik0xNiAwSDMyVjE2SDE2VjBaIiBmaWxsPSIjMDBEOEZGIi8+CjxwYXRoIGQ9Ik0wIDE2SDE2VjMySDBWMTZaIiBmaWxsPSIjMDBEOEZGIi8+CjxwYXRoIGQ9Ik0xNiAxNkgzMlYzMkgxNlYxNloiIGZpbGw9IiMwMEQ4RkYiLz4KPC9zdmc+',
  rdns: 'com.ledger.hardware',
}

// Storage key for persistence
const LEDGER_CONNECTION_KEY = 'ledger_connection_state'

// Connection state persistence
const saveConnectionState = (account: Address | null) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        LEDGER_CONNECTION_KEY,
        JSON.stringify({
          account,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      throw error
    }
  }
}

const getStoredConnectionState = (): { account: Address | null; timestamp: number } | null => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LEDGER_CONNECTION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only consider connections from the last 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed
        }
      }
    } catch (error) {
      throw error
    }
  }
  return null
}

const clearConnectionState = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LEDGER_CONNECTION_KEY)
    } catch (error) {
      throw error
    }
  }
}

export function ledgerConnector(options: LedgerConnectorOptions = {}) {
  let state: LedgerConnectorState = {
    provider: null,
    account: null,
    isConnecting: false,
    lastConnectionAttempt: null,
  }

  // EIP-6963 Provider announcement
  const announceProvider = () => {
    if (typeof window !== 'undefined') {
      const provider = {
        info: { ...LEDGER_PROVIDER_INFO },
        provider: {
          isLedger: true,
          request: async ({ method, params }: { method: string; params?: any[] }) => {
            // This is a placeholder - actual requests go through the connector
            throw new Error('Please connect through the Ledger connector')
          },
        },
      }

      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: Object.freeze(provider),
        }),
      )
    }
  }

  // Announce provider on load and when requested
  if (typeof window !== 'undefined') {
    announceProvider()
    window.addEventListener('eip6963:requestProvider', announceProvider)
  }

  return createConnector<unknown>(config => {
    return {
      id: 'ledger',
      name: 'Ledger',
      type: 'hardware',

      async connect() {
        if (state.isConnecting) {
          throw new Error('Connection already in progress')
        }

        state.isConnecting = true
        state.lastConnectionAttempt = Date.now()

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

          // Connect to the Ledger device with timeout
          const connectPromise = state.provider.connect()
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout - please check your device')), 30000)
          })

          await Promise.race([connectPromise, timeoutPromise])

          // Get the address through the provider's accounts
          const accounts = (await state.provider.request({
            method: 'eth_accounts',
            params: [],
          })) as `0x${string}`[]

          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found on Ledger device')
          }

          const address = accounts[0]
          state.account = address

          // Save connection state for auto-reconnection
          saveConnectionState(address)

          // Emit connection event
          config.emitter.emit('change', {
            accounts: [address],
            chainId,
          })

          // Always return the correct object, never undefined, and ensure type matches wagmi's expectations
          return {
            accounts: [address] as readonly `0x${string}`[],
            chainId,
          }
        } catch (error) {
          // Clear any partial state on error
          state.provider = null
          state.account = null
          clearConnectionState()

          // Debug logging
          console.error('Ledger connection error:', error)
          if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error name:', error.name)
            console.error('Error stack:', error.stack)

            // Enhanced error handling with specific user guidance
            if (error instanceof Error) {
              // Device locked or app not open
              if (
                error.message.includes('0x6a15') ||
                error.message.includes('6a15') ||
                error.message.includes('0x5515') ||
                error.message.includes('5515') ||
                error.message.includes('Locked device') ||
                error.message.includes('Connection declined') ||
                error.message.includes('previous request is still active')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content: 'Please unlock your Ledger device and open the Ethereum app, then try again.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error('Please unlock your Ledger device and open the Ethereum app, then try again.')
              }

              // Device not found or disconnected
              if (
                error.message.includes('0x6e00') ||
                error.message.includes('6e00') ||
                error.message.includes('No device selected') ||
                error.message.includes('0x6d06') ||
                error.message.includes('6d06')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content: 'Ledger device not found. Please connect your device and try again.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error('Ledger device not found. Please connect your device and try again.')
              }

              // App not installed or wrong app open
              if (
                error.message.includes('0x6d00') ||
                error.message.includes('6d00') ||
                error.message.includes('App not found') ||
                error.message.includes('0x6d01') ||
                error.message.includes('6d01') ||
                error.message.includes('0x6d02') ||
                error.message.includes('6d02')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content:
                    'Ethereum app not found on your Ledger device. Please install the Ethereum app using Ledger Live.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error(
                  'Ethereum app not found on your Ledger device. Please install the Ethereum app using Ledger Live.',
                )
              }

              // User rejected
              if (
                error.message.includes('denied') ||
                error.message.includes('rejected') ||
                error.message.includes('User rejected') ||
                error.message.includes('User denied') ||
                error.message.includes('0x6985') ||
                error.message.includes('6985')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content: 'Connection rejected by user.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new UserRejectedRequestError(new Error('Connection rejected by user'))
              }

              // Permission denied
              if (
                error.message.includes('Permission') ||
                error.message.includes('permission') ||
                error.message.includes('access denied') ||
                error.message.includes('0x6a80') ||
                error.message.includes('6a80')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content:
                    'Browser permission denied. Please allow USB/HID access in your browser settings and try again.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error(
                  'Browser permission denied. Please allow USB/HID access in your browser settings and try again.',
                )
              }

              // Browser not supported
              if (
                error.message.includes('not supported') ||
                error.message.includes('unsupported') ||
                error.message.includes('WebUSB not available') ||
                error.message.includes('0x6a81') ||
                error.message.includes('6a81')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content:
                    'Your browser does not support hardware wallet connections. Please use Chrome, Edge, or Opera.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error(
                  'Your browser does not support hardware wallet connections. Please use Chrome, Edge, or Opera.',
                )
              }

              // Timeout
              if (
                error.message.includes('timeout') ||
                error.message.includes('Timeout') ||
                error.message.includes('Connection timed out') ||
                error.message.includes('0x6a82') ||
                error.message.includes('6a82')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content:
                    'Connection timed out. Please ensure your Ledger is unlocked with the Ethereum app open, then try again.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error(
                  'Connection timed out. Please ensure your Ledger is unlocked with the Ethereum app open, then try again.',
                )
              }

              // Transport errors
              if (
                error.message.includes('transport') ||
                error.message.includes('Transport') ||
                error.message.includes('Failed to connect') ||
                error.message.includes('0x6a83') ||
                error.message.includes('6a83')
              ) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content:
                    'Failed to connect to Ledger device. Please disconnect and reconnect your device, then try again.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error(
                  'Failed to connect to Ledger device. Please disconnect and reconnect your device, then try again.',
                )
              }

              // Handle "Connection declined" specifically
              if (error.message.includes('Connection declined')) {
                const toastProps: ToastAlertOptions = {
                  severity: 'error',
                  title: 'Ledger Connection Error',
                  content:
                    'Connection declined. Please ensure your Ledger is unlocked and the Ethereum app is open, then try again.',
                  dataTestId: 'ledger-error',
                  toastId: 'ledger-error',
                }
                showToast(toastProps)
                throw new Error(
                  'Connection declined. Please ensure your Ledger is unlocked and the Ethereum app is open, then try again.',
                )
              }
            }

            if (isUserRejectedRequestError(error)) {
              throw new UserRejectedRequestError(error as Error)
            }

            // Generic error with helpful message
            throw new Error(
              `Failed to connect to Ledger: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure your device is unlocked with the Ethereum app open.`,
            )
          }
          // Always rethrow to avoid returning undefined
          throw error
        } finally {
          state.isConnecting = false
        }
      },

      async disconnect() {
        try {
          if (state.provider) {
            await state.provider.disconnect()
          }
        } catch (error) {
          throw error
        } finally {
          state.provider = null
          state.account = null
          state.isConnecting = false
          clearConnectionState()
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

          // Check if we have an active connection
          if (state.provider && state.account) {
            return true
          }

          // Check for stored connection state for auto-reconnection
          const storedState = getStoredConnectionState()
          if (storedState?.account) {
            // Attempt silent reconnection
            try {
              await this.connect()
              return true
            } catch (error) {
              // Silent fail - user will need to manually reconnect
              clearConnectionState()
              return false
            }
          }

          return false
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
          state.account = null
          clearConnectionState()
          config.emitter.emit('disconnect')
        } else {
          const address = accounts[0] as Address
          state.account = address
          saveConnectionState(address)
          config.emitter.emit('change', { accounts: accounts as readonly Address[] })
        }
      },

      onChainChanged(chainId: string | number) {
        const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId
        config.emitter.emit('change', { chainId: id })
      },

      onDisconnect() {
        state.provider = null
        state.account = null
        state.isConnecting = false
        clearConnectionState()
        config.emitter.emit('disconnect')
      },
    }
  })

  function isUserRejectedRequestError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('User rejected') ||
        error.message.includes('Denied by user') ||
        error.message.includes('User denied') ||
        error.message.includes('rejected by user'))
    )
  }
}
