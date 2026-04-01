import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { extractUserAddressFromToken, isTokenExpired } from './jwt'

interface SiweState {
  // Authentication state
  jwtToken: string | null // JWT token containing userAddress in payload
  isLoading: boolean
  error: Error | null

  // Actions
  setToken: (jwtToken: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  signOut: () => void
}

/**
 * Zustand store for SIWE (Sign-In With Ethereum) authentication state
 *
 * This store manages the global authentication state for the dApp, including:
 * - JWT token storage (synced with localStorage)
 * - Loading and error states
 *
 * The JWT token contains the userAddress in its payload. Authentication status
 * is derived from the token existence and validity - use `selectIsAuthenticated`
 * selector or `useAuth` hook to access it.
 *
 * @example
 * ```tsx
 * import { useSiweStore, selectUserAddress, selectIsAuthenticated } from '@/lib/auth/siweStore'
 *
 * function MyComponent() {
 *   const jwtToken = useSiweStore(state => state.jwtToken)
 *   const isAuthenticated = useSiweStore(selectIsAuthenticated)
 *   const userAddress = useSiweStore(selectUserAddress)
 *   const signOut = useSiweStore(state => state.signOut)
 *
 *   if (!isAuthenticated) {
 *     return <div>Please sign in</div>
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {userAddress}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useSiweStore = create<SiweState>()(
  persist(
    immer(set => ({
      // Initial state
      jwtToken: null,
      isLoading: false,
      error: null,

      /**
       * Sets the JWT token and updates state
       * The JWT token contains userAddress in its payload (see jwt.ts)
       * Authentication status should be derived using selectIsAuthenticated selector
       * Note: Zustand persist middleware handles localStorage automatically
       */
      setToken: (jwtToken: string) => {
        set(state => {
          state.jwtToken = jwtToken
          state.error = null
        })
      },

      /**
       * Sets the loading state
       */
      setLoading: (isLoading: boolean) => {
        set(state => {
          state.isLoading = isLoading
        })
      },

      /**
       * Sets the error state
       */
      setError: (error: Error | null) => {
        set(state => {
          state.error = error
        })
      },

      /**
       * Signs out the user by clearing all authentication state
       * Note: Zustand persist middleware handles localStorage cleanup automatically
       */
      signOut: () => {
        set(state => {
          state.jwtToken = null
          state.error = null
          state.isLoading = false
        })
      },
    })),
    {
      name: 'siwe-auth-storage',
      // Only persist jwtToken, not loading/error (isAuthenticated is derived)
      partialize: state => ({
        jwtToken: state.jwtToken,
      }),
      // Clear expired tokens on rehydration
      onRehydrateStorage: () => state => {
        if (state?.jwtToken && isTokenExpired(state.jwtToken)) {
          state.jwtToken = null
        }
      },
    },
  ),
)

/**
 * Selector to check if user is authenticated
 * Returns true if jwtToken exists and is not expired
 * Use this with useSiweStore to get authentication status
 */
export const selectIsAuthenticated = (state: SiweState): boolean => {
  return state.jwtToken !== null && !isTokenExpired(state.jwtToken)
}

/**
 * Selector to get userAddress from the JWT token
 * Use this with useSiweStore to get the user address
 */
export const selectUserAddress = (state: SiweState): string | null => {
  return extractUserAddressFromToken(state.jwtToken)
}
