export interface Logger {
  log: (...args: any[]) => void
  error: (...args: any[]) => void
  warn?: (...args: any[]) => void
  info?: (...args: any[]) => void
}

export interface TrezorConnectorOptions {
  email?: string
  appUrl?: string
  derivationPath?: string
  logger?: Logger
}

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface EIP6963Provider {
  request: (params: { method: string; params?: any[] }) => Promise<any>
  isMetaMask: boolean
  isTrezor: boolean
}

export interface TransactionParameters {
  to: string
  nonce?: string
  gasPrice?: string
  gas?: string
  gasLimit?: string
  value?: string
  data?: string
}
