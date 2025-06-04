import TrezorConnect from '@trezor/connect-web'
import { getAddress } from 'viem'
import type { Logger, EIP6963Provider, EIP6963ProviderInfo, TransactionParameters } from './types'

type Address = `0x${string}`

/**
 * TrezorHardwareWallet class provides core integration with Trezor hardware wallets
 * following EIP-6963 standard for wallet discovery
 */
export class TrezorHardwareWallet {
  // ===== CONFIGURATION PROPERTIES =====
  /** Email for Trezor Connect manifest */
  private readonly email: string

  /** App URL for Trezor Connect manifest */
  private readonly appUrl: string

  /** Derivation path for Ethereum addresses */
  private readonly derivationPath: string

  /** Default chain ID to use when none is specified */
  private readonly defaultChainId: number

  /** RPC URLs for each chain ID */
  private readonly rpcUrls: Record<number, string>

  /** Logger instance for debugging and error reporting */
  private readonly logger: Logger

  // ===== STATE PROPERTIES =====
  /** Current connected wallet address */
  private currentAddress: Address | undefined = undefined

  /** Current blockchain chain ID */
  private currentChainId: number | undefined = undefined

  /** Initialization status flag */
  private isInitialized: boolean = false

  /** Flag to control logging behavior */
  private shouldLog = true

  /** EIP-6963 provider information */
  static readonly PROVIDER_INFO: EIP6963ProviderInfo = {
    uuid: 'io.trezor.hardware-wallet',
    name: 'Trezor',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjEuNzY4IDQwLjc3MSIgZmlsbD0ibm9uZSIgY2xhc3M9ImgtNiB3LWF1dG8gdGV4dC1ncmF5MTAwMCIgZGF0YS10ZXN0aWQ9IkBsb2dvL1RyZXpvckxvZ28iPjxwYXRoIGNsYXNzPSJ0cmV6b3ItbG9nby10cmV6b3IiIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTI0LjMwNiA5LjQ2MUMyNC4zMDYgNC4yOSAxOS43NjEgMCAxNC4yMjggMCA4LjY5NCAwIDQuMTQ4IDQuMjkyIDQuMTQ4IDkuNDZ2My4wMjVIMHYyMS43NWwxNC4yMjUgNi41MzYgMTQuMjMzLTYuNTM0VjEyLjU4MUgyNC4zMWwtLjAwMy0zLjEyMVptLTE1LjAyIDBjMC0yLjQzOCAyLjE3NS00LjM4OSA0Ljk0Mi00LjM4OSAyLjc2NyAwIDQuOTQgMS45NTEgNC45NCA0LjM4OXYzLjAyNEg5LjI4N1Y5LjQ2MVptMTMuNDQgMjEuMjY0LTguNTAyIDMuOTA0LTguNDk5LTMuOTAxVjE3LjY1NWgxN3YxMy4wN3oiLz48cGF0aCBjbGFzcz0idHJlem9yLWxvZ28tdGV4dCIgZmlsbD0iY3VycmVudENvbG9yIiBkPSJNNDAuMDE5IDEyLjQ4NWgxNy44ODZ2NS4xN2gtNi4xMjd2MTYuNjc4aC01LjczMVYxNy42NTVoLTYuMDI4Wk03OC40NiAxOS44YzAtNC4zOS0zLjA2NC03LjIxOC03LjYwOS03LjIxOEg2MC40NzR2MjEuNzVoNS43MzJ2LTcuMzE0aDIuMTc0bDQuMDUxIDcuMzE0aDYuNjI3bC00Ljg0Mi04LjA5NGMyLjA3LS43OCA0LjI0NC0yLjgzIDQuMjQ0LTYuNDM4em0tOC4yOTYgMi4xNDZoLTMuOTU4di00LjM5aDMuOTUzYzEuNDgyIDAgMi40Ny44NzkgMi40NyAyLjE0NyAwIDEuMzY1LS45ODggMi4yNDMtMi40NyAyLjI0M3ptMTAuOTYzLTkuNDYxaDE2LjAwOXY1LjA3Mkg4Ni44NTh2My4yMTloOS45ODJ2NC45NzRoLTkuOTgydjMuNTFoMTAuMjc4djUuMDczSDgxLjEyN1ptNDguMTI1LS4yOTRjLTYuNzE5IDAtMTEuNDYgNC43OC0xMS40NiAxMS4yMTggMCA2LjQzNyA0LjgzOSAxMS4yMiAxMS40NiAxMS4yMnMxMS41NjItNC43NzkgMTEuNTYyLTExLjIxN2MwLTYuNDM4LTQuODQyLTExLjIyLTExLjU2Mi0xMS4yMnptMCAxNy4zNjNjLTMuMzU5IDAtNS42MzMtMi41MzYtNS42MzMtNi4xNCAwLTMuNzA3IDIuMjc0LTYuMTQyIDUuNjMzLTYuMTQyIDMuMzYgMCA1LjczMiAyLjUzNyA1LjczMiA2LjE0MSAwIDMuNjA1LTIuMzcyIDYuMTQtNS43MzIgNi4xNHptMjcuNjctMy4zMTZjMi4wNzQtLjc4IDQuMjUtMi44MyA0LjI1LTYuNDM4IDAtNC4zOS0zLjA2NC03LjIxOC03LjYxLTcuMjE4aC0xMC4zNzV2MjEuNzVoNS43MzF2LTcuMzE0aDIuMTc4bDQuMDUxIDcuMzE0aDYuNjIxem0tNC4wNTItNC4yOTJoLTMuOTUydi00LjM5aDMuOTUyYzEuNDg0IDAgMi40NzEuODc5IDIuNDcxIDIuMTQ3IDAgMS4zNjUtLjk4NyAyLjI0My0yLjQ3MSAyLjI0M3ptLTUyLjk2Ny05LjQ2MWgxNi44OTh2NC4zODlsLTkuMTkgMTIuMjloOS4xOXY1LjE2OUg5OS45MDN2LTQuMzlsOS4xOS0xMi4yODhoLTkuMTl6Ii8+PC9zdmc+',
    rdns: 'io.trezor.hardware',
  } as const

  // ===== CONSTRUCTOR =====

  /**
   * Creates a new TrezorHardwareWallet instance
   * @param options Configuration options for the wallet
   */
  constructor(options: {
    email: string
    appUrl: string
    derivationPath: string
    defaultChainId: number
    rpcUrls: Record<number, string>
    logger?: Logger
    shouldLog?: boolean
  }) {
    this.email = options.email
    this.appUrl = options.appUrl
    this.derivationPath = options.derivationPath
    this.defaultChainId = options.defaultChainId
    this.rpcUrls = options.rpcUrls
    this.logger = options.logger || console
    this.shouldLog = options.shouldLog || false

    this.log('[Trezor] Created wallet with options:', options)
  }

  // ===== CORE WALLET METHODS =====
  /**
   * Logs messages using the configured logger instance
   * @param args - Arguments to log
   */
  private log(...args: any[]): void {
    if (this.shouldLog) {
      this.logger.log(...args)
    }
  }

  /**
   * Logs error messages using the configured logger instance
   * @param args - Arguments to log as errors
   */
  private logError(...args: any[]): void {
    if (this.shouldLog) {
      this.logger.error(...args)
    }
  }

  /**
   * Sets up the Trezor connector and initializes TrezorConnect
   * @returns Promise that resolves when setup is complete
   */
  async setup(): Promise<void> {
    this.log('[Trezor] Setting up wallet')

    try {
      await TrezorConnect.init({
        lazyLoad: true,
        manifest: {
          email: this.email,
          appUrl: this.appUrl,
        },
      })

      this.isInitialized = true
      this.log('[Trezor] TrezorConnect initialized successfully')

      if (typeof window !== 'undefined') {
        this.announceProvider()

        const handleProviderRequest = () => {
          this.log('[Trezor] Responding to EIP-6963 provider request')
          this.announceProvider()
        }

        window.addEventListener('eip6963:requestProvider', handleProviderRequest)

        // return () => {
        //   window.removeEventListener('eip6963:requestProvider', handleProviderRequest)
        // }
      }
    } catch (error) {
      this.logError('[Trezor] Failed to initialize TrezorConnect:', error)
      throw error
    }
  }

  /**
   * Connects to the Trezor wallet and retrieves account information
   * @param params - Connection parameters including optional chainId
   * @returns Promise resolving to a connection result with accounts and chainId
   */
  async connect(params: { chainId?: number } = {}): Promise<{ accounts: Address[]; chainId: number }> {
    this.log('[Trezor] Connect requested with chainId:', params.chainId)

    if (!this.isInitialized) {
      this.log('[Trezor] Not initialized, running setup first')
      await this.setup()
    }

    try {
      // This sets the this.currentAddress
      await this.getAccounts()

      this.currentChainId = params.chainId || this.defaultChainId

      this.log('[Trezor] Successfully connected:', {
        address: this.currentAddress,
        chainId: this.currentChainId,
      })

      return {
        accounts: [this.currentAddress as Address],
        chainId: this.currentChainId as number,
      }
    } catch (error) {
      this.logError('[Trezor] Error during connection:', error)

      if (error instanceof Error && error.message?.includes('Popup closed')) {
        throw new Error('Connection cancelled by user')
      }
      throw error
    }
  }

  /**
   * Disconnects from the Trezor wallet
   */
  async disconnect(): Promise<void> {
    this.log('[Trezor] Disconnect requested')
    this.currentAddress = undefined
    this.currentChainId = undefined
  }

  /**
   * Retrieves the currently connected accounts
   * @returns Promise resolving to array of connected addresses
   */
  async getAccounts(): Promise<Address[]> {
    this.log('[Trezor] getAccounts called, current address:', this.currentAddress)

    if (this.currentAddress) {
      return [this.currentAddress]
    }

    try {
      this.log('[Trezor] getAccounts: Attempting to retrieve address from ethereumGetAddress')
      const result = await TrezorConnect.ethereumGetAddress({
        path: this.derivationPath,
        showOnTrezor: false,
      })

      if (result.success) {
        this.currentAddress = getAddress(result.payload.address)
        this.log('[Trezor] Retrieved address:', this.currentAddress)
        return [this.currentAddress]
      } else {
        this.log('[Trezor] Failed to get address:', result.payload.error)
      }
    } catch (error) {
      this.logError('[Trezor] Error getting accounts:', error)
    }

    return []
  }

  /**
   * Gets the current chain ID
   * @returns Promise resolving to the current chain ID
   */
  async getChainId(): Promise<number> {
    const chainId = this.currentChainId || this.defaultChainId
    this.log('[Trezor] getChainId returning:', chainId)
    return chainId
  }

  /**
   * Gets the EIP-6963 provider instance
   * @returns Promise resolving to the provider
   */
  async getProvider(): Promise<EIP6963Provider> {
    this.log('[Trezor] getProvider called')
    return this.createEIP6963Provider()
  }

  /**
   * Checks if the wallet is authorized/connected
   * @returns Promise resolving to authorization status
   */
  async isAuthorized(): Promise<boolean> {
    this.log('[Trezor] isAuthorized check')
    try {
      const accounts = await this.getAccounts()
      const authorized = accounts.length > 0
      this.log('[Trezor] Authorization status:', authorized)
      return authorized
    } catch (error) {
      this.logError('[Trezor] Error checking authorization:', error)
      return false
    }
  }

  /**
   * Attempts to switch to a different chain (not supported by Trezor)
   * @param params - Chain switching parameters
   * @throws Error indicating chain switching is not supported
   */
  async switchChain(params: { chainId: number }): Promise<never> {
    this.log('[Trezor] switchChain requested to:', params.chainId)
    throw new Error('Trezor does not support programmatic chain switching. Please switch manually.')
  }

  // ===== EIP-6963 PROVIDER METHODS =====
  /**
   * Creates an EIP-6963 compliant provider instance
   * @returns EIP-6963 provider object
   */
  private createEIP6963Provider(): EIP6963Provider {
    this.log('[Trezor] Creating EIP-6963 provider')

    return {
      request: async ({ method, params }: { method: string; params?: any[] }) => {
        this.log('[Trezor] EIP-6963 request:', method, params)
        return this.handleProviderRequest(method, params)
      },
      isMetaMask: false,
      isTrezor: true,
    }
  }

  /**
   * Announces the EIP-6963 provider to the window
   */
  private announceProvider(): void {
    if (typeof window === 'undefined') return

    this.log('[Trezor] Announcing EIP-6963 provider')

    const detail = {
      info: TrezorHardwareWallet.PROVIDER_INFO,
      provider: this.createEIP6963Provider(),
    }

    window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }))
  }

  // ===== RPC METHOD HANDLERS =====
  /**
   * Handles EIP-6963 provider requests using method switching
   * @param method - RPC method name
   * @param params - Method parameters
   * @returns Promise resolving to a method result
   */
  private async handleProviderRequest(method: string, params?: any[]): Promise<any> {
    switch (method) {
      case 'eth_accounts':
        return this.handleEthAccounts()
      case 'eth_requestAccounts':
        return this.handleEthRequestAccounts()
      case 'eth_chainId':
        return this.handleEthChainId()
      case 'wallet_switchEthereumChain':
        return this.handleWalletSwitchChain()
      case 'eth_sendTransaction':
        return this.handleEthSendTransaction(params)
      default:
        this.log('[Trezor] Unsupported method:', method)
        throw new Error(`Method ${method} not supported by Trezor connector`)
    }
  }

  /**
   * Handles eth_accounts RPC method
   */
  private async handleEthAccounts(): Promise<Address[]> {
    return this.currentAddress ? [this.currentAddress] : []
  }

  /**
   * Handles eth_requestAccounts RPC method
   */
  private async handleEthRequestAccounts(): Promise<Address[]> {
    if (this.currentAddress) {
      return [this.currentAddress]
    }

    try {
      await this.getAccounts()
      return [this.currentAddress as unknown as Address]
    } catch (error) {
      this.logError('[Trezor] Error in eth_requestAccounts:', error)
      throw error
    }
  }

  /**
   * Handles eth_chainId RPC method
   */
  private async handleEthChainId(): Promise<string> {
    const chainId = this.currentChainId || this.defaultChainId
    this.log('[Trezor] Returning chainId:', chainId)
    return `0x${chainId.toString(16)}`
  }

  /**
   * Handles wallet_switchEthereumChain RPC method
   */
  private async handleWalletSwitchChain(): Promise<never> {
    this.log('[Trezor] Chain switch requested, not supported by hardware wallet')
    throw new Error('Trezor does not support programmatic chain switching')
  }

  /**
   * Handles eth_sendTransaction RPC method
   * @param params - Transaction parameters
   */
  private async handleEthSendTransaction(params?: any[]): Promise<string> {
    if (!params || !params[0]) {
      throw new Error('Transaction parameters required')
    }

    const txParams = params[0]
    this.log('[Trezor] Signing transaction:', txParams)

    if (!this.currentAddress) {
      throw new Error('No account connected')
    }

    try {
      const chainId = this.currentChainId || this.defaultChainId
      const rpcUrl = this.rpcUrls[chainId]

      if (!rpcUrl) {
        throw new Error(`No RPC URL available for chain ID ${chainId}`)
      }

      // Fetch transaction parameters
      const [nonce, gasPrice, estimatedGas] = await this.fetchTransactionParameters(rpcUrl, txParams)

      this.log('[Trezor] Gas parameters:', { nonce, gasPrice, estimatedGas })

      // Sign transaction with Trezor
      const result = await TrezorConnect.ethereumSignTransaction({
        path: this.derivationPath,
        transaction: {
          to: txParams.to,
          value: txParams.value || '0x0',
          data: txParams.data || '0x',
          chainId: chainId,
          nonce: nonce,
          gasLimit: estimatedGas,
          gasPrice: gasPrice,
        },
      })

      if (!result.success) {
        this.logError('[Trezor] Transaction signing failed:', result.payload.error)
        throw new Error(result.payload.error || 'Transaction signing failed')
      }

      this.log('[Trezor] Transaction signed successfully')

      // Broadcast the signed transaction
      try {
        const txHash = await this.rpcCall(rpcUrl, 'eth_sendRawTransaction', [result.payload.serializedTx])
        this.log('[Trezor] Transaction broadcasted:', txHash)
        return txHash
      } catch (broadcastError) {
        this.logError('[Trezor] Failed to broadcast transaction:', broadcastError)
        throw new Error(`Failed to broadcast transaction: ${(broadcastError as Error).message}`)
      }
    } catch (error) {
      this.logError('[Trezor] Transaction signing error:', error)
      if ((error as Error).message?.includes('Popup closed')) {
        throw new Error('Transaction cancelled by user')
      }
      throw error
    }
  }

  // ===== UTILITY METHODS =====
  /**
   * Makes an RPC call to the blockchain
   * @param rpcUrl - RPC endpoint URL
   * @param method - RPC method name
   * @param params - Method parameters
   * @returns Promise resolving to RPC result
   */
  private async rpcCall(rpcUrl: string, method: string, params: any[]): Promise<any> {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`)
    }
    return data.result
  }

  /**
   * Fetches required transaction parameters (nonce, gas price, gas limit)
   * @param rpcUrl - RPC endpoint URL
   * @param txParams - Transaction parameters
   * @returns Promise resolving to [nonce, gasPrice, estimatedGas]
   */
  private async fetchTransactionParameters(
    rpcUrl: string,
    txParams: TransactionParameters,
  ): Promise<[string, string, string]> {
    // Use provided values or prepare to fetch them
    const {
      nonce: providedNonce,
      gasPrice: providedGasPrice,
      gas: providedGas,
      gasLimit: providedGasLimit,
      to,
      value = '0x0',
      data = '0x',
    } = txParams

    // If all parameters are provided, return them immediately
    if (providedNonce && providedGasPrice && (providedGas || providedGasLimit)) {
      // Ensure we have a gas value (either gas or gasLimit)
      const gasValue = providedGas || providedGasLimit
      // Since we've checked that either providedGas or providedGasLimit exists,
      // we can safely assert gasValue is a string
      return [providedNonce, providedGasPrice, gasValue as string]
    }

    // Prepare batch RPC request
    const batchRequests = []
    const resultMapping = {} as Record<string, number>
    let requestIndex = 0

    // Add necessary RPC calls to the batch
    if (!providedNonce) {
      resultMapping.nonce = requestIndex++
      batchRequests.push({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [this.currentAddress!, 'pending'],
        id: resultMapping.nonce + 1,
      })
    }

    if (!providedGasPrice) {
      resultMapping.gasPrice = requestIndex++
      batchRequests.push({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: resultMapping.gasPrice + 1,
      })
    }

    if (!providedGas && !providedGasLimit) {
      resultMapping.estimatedGas = requestIndex++
      batchRequests.push({
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [
          {
            from: this.currentAddress!,
            to,
            value,
            data,
          },
        ],
        id: resultMapping.estimatedGas + 1,
      })
    }

    // Execute batch RPC request
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchRequests),
    })

    const results = await response.json()

    // Handle error in batch response (if it's a single object with error)
    if (!Array.isArray(results) && results.error) {
      throw new Error(`RPC Error: ${results.error.message}`)
    }

    // Process batch results - sorted by response ID
    const sortedResults = Array.isArray(results) ? results.sort((a, b) => a.id - b.id) : [results]

    // Extract results or throw errors
    sortedResults.forEach(result => {
      if (result.error) {
        throw new Error(`RPC Error: ${result.error.message}`)
      }
    })

    // Prepare final values with fallbacks to provided parameters
    const nonce =
      providedNonce ||
      (resultMapping.nonce !== undefined ? sortedResults[resultMapping.nonce].result : undefined)
    const gasPrice =
      providedGasPrice ||
      (resultMapping.gasPrice !== undefined ? sortedResults[resultMapping.gasPrice].result : undefined)
    const estimatedGas =
      providedGas ||
      providedGasLimit ||
      (resultMapping.estimatedGas !== undefined
        ? sortedResults[resultMapping.estimatedGas].result
        : undefined)

    if (!nonce || !gasPrice || !estimatedGas) {
      throw new Error('Failed to fetch transaction parameters')
    }

    return [nonce, gasPrice, estimatedGas]
  }

  // ===== EVENT HANDLERS =====

  /**
   * Handles account change events (no-op for hardware wallets)
   */
  onAccountsChanged(): void {
    this.log('[Trezor] onAccountsChanged - hardware wallets do not change accounts automatically')
  }

  /**
   * Handles chain change events
   */
  onChainChanged(): void {
    this.log('[Trezor] onChainChanged')
  }

  /**
   * Handles connection events
   */
  onConnect(): void {
    this.log('[Trezor] onConnect event')
  }

  /**
   * Handles disconnection events
   */
  onDisconnect(): void {
    this.log('[Trezor] onDisconnect event')
    this.currentAddress = undefined
    this.currentChainId = undefined
  }
}
