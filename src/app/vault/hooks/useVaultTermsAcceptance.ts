import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'

const VAULT_TERMS_ACCEPTANCE_KEY = 'vault-terms-acceptance'

/**
 * Custom hook to manage Terms & Conditions acceptance state in localStorage
 * based on the connected wallet address
 */
export const useVaultTermsAcceptance = () => {
  const { address } = useAccount()

  const getStorageKey = useCallback((walletAddress: string) => {
    return `${VAULT_TERMS_ACCEPTANCE_KEY}-${walletAddress.toLowerCase()}`
  }, [])

  const hasAcceptedTerms = useMemo(() => {
    if (!address) return false

    try {
      const key = getStorageKey(address)
      const accepted = localStorage.getItem(key)
      return accepted === 'true'
    } catch (error) {
      // Ignore localStorage errors and return false
      return false
    }
  }, [address, getStorageKey])

  const acceptTerms = useCallback(() => {
    if (!address) return

    try {
      const key = getStorageKey(address)
      localStorage.setItem(key, 'true')
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [address, getStorageKey])

  const resetTermsAcceptance = useCallback(() => {
    if (!address) return

    try {
      const key = getStorageKey(address)
      localStorage.removeItem(key)
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [address, getStorageKey])

  return {
    hasAcceptedTerms,
    acceptTerms,
    resetTermsAcceptance,
  }
}
