import type { BtcVaultService } from './types'
import { MockBtcVaultService } from './mock/MockBtcVaultService'
import { ContractBtcVaultService } from './contract/ContractBtcVaultService'

export type { BtcVaultService } from './types'

export function createBtcVaultService(source?: 'mock' | 'contract'): BtcVaultService {
  const resolved = source ?? (process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE as 'mock' | 'contract') ?? 'mock'

  switch (resolved) {
    case 'contract':
      return new ContractBtcVaultService()
    case 'mock':
    default:
      return new MockBtcVaultService()
  }
}
