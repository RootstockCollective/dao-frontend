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
    icon: 'data:image/png;base64,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',
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
          appName: 'Trezor Hardware Wallet',
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
    return false // Trezor does not saves sessions, always returns false
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
