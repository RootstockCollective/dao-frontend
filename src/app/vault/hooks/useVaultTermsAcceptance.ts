import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'

import { getWalletStorageKey, safeStorage } from '@/lib/utils'

// Keep this key and the stored `true` as they are: changing them would ask every holder to accept again
const VAULT_TERMS_ACCEPTANCE_KEY = 'vault-terms-acceptance'

/**
 * Custom hook to manage Terms & Conditions acceptance state in localStorage
 * based on the connected wallet address
 */
export const useVaultTermsAcceptance = () => {
  const { address } = useAccount()
  const key = address ? getWalletStorageKey(VAULT_TERMS_ACCEPTANCE_KEY, address) : null

  const hasAcceptedTerms = useMemo(() => (key ? safeStorage.get(key) === true : false), [key])

  const acceptTerms = useCallback(() => {
    if (key) safeStorage.set(key, true)
  }, [key])

  const resetTermsAcceptance = useCallback(() => {
    if (key) safeStorage.remove(key)
  }, [key])

  return {
    hasAcceptedTerms,
    acceptTerms,
    resetTermsAcceptance,
  }
}
