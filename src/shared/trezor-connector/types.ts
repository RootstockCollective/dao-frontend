export interface Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (...args: any[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...args: any[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn?: (...args: any[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
