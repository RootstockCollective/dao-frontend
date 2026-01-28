import { useSiweStore, selectUserAddress, selectIsAuthenticated } from '@/lib/auth/siweStore'

/**
 * Hook for accessing SIWE authentication state
 * This is a convenience hook that provides read-only access to auth state
 * without requiring the full sign-in functionality
 *
 * The `isAuthenticated` status is derived from jwtToken existence and validity.
 * The userAddress is extracted from the JWT token payload on-demand.
 *
 * @example
 * ```tsx
 * import { useAuth } from '@/shared/hooks/useAuth'
 *
 * function MyComponent() {
 *   const { isAuthenticated, userAddress } = useAuth()
 *
 *   if (!isAuthenticated) {
 *     return <div>Please sign in</div>
 *   }
 *
 *   return <div>Welcome, {userAddress}</div>
 * }
 * ```
 */
export function useAuth() {
  const jwtToken = useSiweStore(state => state.jwtToken)
  const isLoading = useSiweStore(state => state.isLoading)
  const error = useSiweStore(state => state.error)
  const isAuthenticated = useSiweStore(selectIsAuthenticated)
  const userAddress = useSiweStore(selectUserAddress)

  return {
    isAuthenticated,
    userAddress,
    jwtToken,
    isLoading,
    error,
  }
}
