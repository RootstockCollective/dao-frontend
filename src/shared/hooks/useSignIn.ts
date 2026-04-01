import { useAccount, useSignMessage } from 'wagmi'
import { useSiweStore, selectIsAuthenticated } from '@/lib/auth/siweStore'
import type { RequestChallengeResult, VerifySignatureResult } from '@/lib/auth/actions'

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
 * Uses server-controlled challenge generation for enhanced security.
 * The SIWE message is created entirely on the server, eliminating
 * any possibility of client-side manipulation.
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
  const { signMessageAsync, isPending } = useSignMessage()

  // Get state and actions from Zustand store
  const { error, isLoading: storeLoading, setToken, setLoading, setError, signOut } = useSiweStore()

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

      // Request challenge from server (creates SIWE message server-side)
      const challengeRes = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      if (!challengeRes.ok) {
        const { error } = await challengeRes.json()
        throw new Error(error || 'Challenge request failed')
      }

      const { challengeId, message }: RequestChallengeResult = await challengeRes.json()

      // Sign the server-provided message with the wallet
      const signature = await signMessageAsync({ message })

      // Verify signature with server and get JWT token
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, signature }),
      })

      if (!loginRes.ok) {
        const { error } = await loginRes.json()
        throw new Error(error || 'Login failed')
      }

      const { token: jwtToken }: VerifySignatureResult = await loginRes.json()

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
