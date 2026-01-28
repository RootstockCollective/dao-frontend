import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { useEffect } from 'react'
import { createSiweMessage } from '@/lib/auth/siwe'
import { generateNonce } from '@/lib/auth/actions'
import { useSiweStore, selectIsAuthenticated } from '@/lib/auth/siweStore'

interface SignInResult {
  token: string
}

interface UseSignInReturn {
  signIn: () => Promise<string | null>
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
  signOut: () => void
}

/**
 * Hook for SIWE (Sign-In With Ethereum) authentication
 *
 * @example
 * ```tsx
 * const { signIn, isLoading, error, isAuthenticated, signOut } = useSignIn()
 *
 * const handleLogin = async () => {
 *   const token = await signIn()
 *   if (token) {
 *     console.log('Logged in successfully!')
 *   }
 * }
 * ```
 */
export function useSignIn(): UseSignInReturn {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync, isPending } = useSignMessage()

  // Get state and actions from Zustand store
  const {
    error,
    isLoading: storeLoading,
    setToken,
    setLoading,
    setError,
    signOut: storeSignOut,
    initialize,
  } = useSiweStore()

  // Derive isAuthenticated from jwtToken
  const isAuthenticated = useSiweStore(selectIsAuthenticated)

  const signIn = async (): Promise<string | null> => {
    if (!isConnected || !address) {
      setError(new Error('Wallet not connected'))
      return null
    }

    try {
      setError(null)
      setLoading(true)

      // Request nonce from server (stored in SQLite with 1 minute expiration)
      const nonce = await generateNonce()
      const domain = window.location.hostname
      const origin = window.location.origin

      // Build SIWE message with server-generated nonce
      const message = createSiweMessage(address, nonce, domain, origin, chainId)

      // Sign the message with the wallet
      const signature = await signMessageAsync({
        message,
      })

      // Send to backend for verification and get JWT token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          signature,
          address,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: SignInResult = await response.json()
      const jwtToken = data.token

      // Store jwtToken in Zustand store (which also updates localStorage)
      setToken(jwtToken)

      return jwtToken
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    storeSignOut()
  }

  // Initialize store from localStorage on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Combine wagmi's isPending with store's loading state
  const isLoading = isPending || storeLoading

  return {
    signIn,
    isLoading,
    error,
    isAuthenticated,
    signOut,
  }
}
