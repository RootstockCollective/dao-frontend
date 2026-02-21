import { useContext } from 'react'
import { BtcVaultServiceContext } from '../providers/BtcVaultServiceProvider'
import type { BtcVaultService } from '../services'

export function useBtcVaultService(): BtcVaultService {
  const service = useContext(BtcVaultServiceContext)
  if (!service) {
    throw new Error('useBtcVaultService must be used within a BtcVaultServiceProvider')
  }
  return service
}
