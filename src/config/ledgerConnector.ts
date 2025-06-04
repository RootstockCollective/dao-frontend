import { createConnector } from 'wagmi'
import { Chain, Address, UserRejectedRequestError, SwitchChainError } from 'viem'
import type Transport from '@ledgerhq/hw-transport'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import Eth from '@ledgerhq/hw-app-eth'
import { TransportStatusError } from '@ledgerhq/errors'

export interface LedgerConnectorOptions {
  chainId?: number
}

interface LedgerConnectorState {
  transport: Transport | null
  eth: Eth | null
  account: Address | null
  derivationPath: string
}

export function ledgerConnector(options: LedgerConnectorOptions = {}) {
  let state: LedgerConnectorState = {
    transport: null,
    eth: null,
    account: null,
    derivationPath: "44'/60'/0'/0/0", // Default Ethereum derivation path
  }

  return createConnector<unknown>(config => ({
    id: 'ledger',
    name: 'Ledger',
    type: 'hardware',

    async connect() {
      try {
        await connectToDevice()

        if (!state.eth) {
          throw new Error('Failed to initialize Ledger Ethereum app')
        }

        // Get the first account
        const account = await getAccount()
        state.account = account

        // Emit connection event
        const chainId = options?.chainId || config.chains[0]?.id || 1
        config.emitter.emit('change', {
          accounts: [account],
          chainId,
        })

        return {
          accounts: [account],
          chainId,
        }
      } catch (error) {
        if (isUserRejectedRequestError(error)) {
          throw new UserRejectedRequestError(error as Error)
        }
        throw error
      }
    },

    async disconnect() {
      try {
        if (state.transport) {
          await state.transport.close()
        }
      } catch (error) {
        console.warn('Error closing Ledger transport:', error)
      } finally {
        state.transport = null
        state.eth = null
        state.account = null
        // Emit disconnect event to ensure proper cleanup
        config.emitter.emit('disconnect')
      }
    },

    async getAccounts() {
      if (!state.account) {
        state.account = await getAccount()
      }
      return [state.account]
    },

    async getChainId() {
      return options?.chainId || config.chains[0]?.id || 1
    },

    async getProvider() {
      return {
        request: async ({ method, params }: { method: string; params?: any[] }) => {
          switch (method) {
            case 'eth_requestAccounts':
              const accounts = await this.getAccounts()
              config.emitter.emit('change', {
                accounts,
                chainId: await this.getChainId(),
              })
              return accounts
            case 'eth_accounts':
              return state.account ? [state.account] : []
            case 'eth_chainId':
              return `0x${(await this.getChainId()).toString(16)}`
            case 'personal_sign':
              return signMessage(params?.[0])
            case 'eth_signTypedData_v4':
              return signTypedData(params?.[1])
            case 'eth_sendTransaction':
              throw new Error('Direct transaction sending not implemented. Use signTransaction instead.')
            default:
              throw new Error(`Unsupported method: ${method}`)
          }
        },
      }
    },

    async isAuthorized() {
      try {
        // Check if we have a stored account
        if (state.account) {
          return true
        }

        // Try to reconnect if we have no active connection
        if (!state.transport || !state.eth) {
          try {
            await connectToDevice()
            const account = await getAccount()
            state.account = account
            return true
          } catch {
            return false
          }
        }

        return !!(await getAccount())
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
  }))

  async function connectToDevice(): Promise<void> {
    try {
      // Ensure any existing connection is closed first
      if (state.transport) {
        try {
          await state.transport.close()
        } catch (e) {
          console.warn('Error closing existing transport:', e)
        }
        state.transport = null
        state.eth = null
      }

      // Try WebHID first (preferred for modern browsers)
      if (await TransportWebHID.isSupported()) {
        // Create new transport with a small delay to ensure previous connections are cleaned up
        await new Promise(resolve => setTimeout(resolve, 1000))
        state.transport = await TransportWebHID.create()
      }
      // Fallback to WebUSB
      else if (await TransportWebUSB.isSupported()) {
        // Create new transport with a small delay to ensure previous connections are cleaned up
        await new Promise(resolve => setTimeout(resolve, 1000))
        state.transport = await TransportWebUSB.create()
      } else {
        throw new Error(
          'No compatible transport found. Please ensure your browser supports WebHID or WebUSB.',
        )
      }

      state.eth = new Eth(state.transport)
    } catch (error) {
      // Clean up state in case of error
      state.transport = null
      state.eth = null

      if (error instanceof TransportStatusError) {
        throw new Error('Ledger device: Please ensure the Ethereum app is open and ready')
      }
      throw error
    }
  }

  async function getAccount(): Promise<Address> {
    if (!state.eth) {
      throw new Error('Ledger not connected')
    }

    try {
      const result = await state.eth.getAddress(state.derivationPath)
      return result.address as Address
    } catch (error) {
      if (error instanceof TransportStatusError) {
        throw new Error('Please unlock your Ledger device and open the Ethereum app')
      }
      throw error
    }
  }

  async function signMessage(message: string): Promise<string> {
    if (!state.eth) {
      throw new Error('Ledger not connected')
    }

    try {
      const messageBytes = message.startsWith('0x')
        ? Buffer.from(message.slice(2), 'hex')
        : Buffer.from(message, 'utf8')

      const result = await state.eth.signPersonalMessage(state.derivationPath, messageBytes.toString('hex'))
      const signature = `0x${result.r}${result.s}${result.v.toString(16).padStart(2, '0')}`
      return signature
    } catch (error) {
      if (isUserRejectedRequestError(error)) {
        throw new UserRejectedRequestError(error as Error)
      }
      throw error
    }
  }

  async function signTypedData(typedData: string): Promise<string> {
    if (!state.eth) {
      throw new Error('Ledger not connected')
    }

    try {
      const parsedData = JSON.parse(typedData)

      // For EIP-712 signing, we need to use the appropriate method
      const result = await state.eth.signEIP712Message(state.derivationPath, parsedData)
      const signature = `0x${result.r}${result.s}${result.v.toString(16).padStart(2, '0')}`
      return signature
    } catch (error) {
      if (isUserRejectedRequestError(error)) {
        throw new UserRejectedRequestError(error as Error)
      }
      throw error
    }
  }

  function isUserRejectedRequestError(error: unknown): boolean {
    return (
      error instanceof TransportStatusError &&
      (error.statusCode === 0x6985 || // User rejected
        error.statusCode === 0x6a80) // Invalid data received
    )
  }
}
