import posthog from 'posthog-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { POSTHOG_ENVIRONMENT } from '@/lib/posthog-environment'

import type { SiweSession } from './jwt'

interface SiweState {
  // Authentication state
  session: SiweSession | null
  isLoading: boolean
  error: Error | null

  // Actions
  setSession: (session: SiweSession) => void
  clearSession: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  signOut: () => void
}

/**
 * Zustand store for SIWE (Sign-In With Ethereum) authentication state
 *
 * This store manages the global authentication state for the dApp, including:
 * - The session's address and expiry (synced with localStorage)
 * - Loading and error states
 *
 * The JWT never reaches this store: /api/auth/login keeps it in the HTTP-only
 * `auth-token` cookie, which the browser sends on same-origin requests.
 * Authentication status is derived from the session's expiry - use
 * `selectIsAuthenticated` selector or `useSignIn` hook to access it.
 *
 * @example
 * ```tsx
 * import { useSiweStore, selectUserAddress, selectIsAuthenticated } from '@/lib/auth/siweStore'
 *
 * function MyComponent() {
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
      session: null,
      isLoading: false,
      error: null,

      /**
       * Stores the session returned by /api/auth/login
       * Note: Zustand persist middleware handles localStorage automatically
       */
      setSession: (session: SiweSession) => {
        set(state => {
          state.session = session
          state.error = null
        })
      },

      /**
       * Forgets the session locally, e.g. after the server rejected the cookie
       */
      clearSession: () => {
        set(state => {
          state.session = null
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
       *
       * The JWT lives in an HTTP-only `auth-token` cookie set by
       * /api/auth/login. That cookie cannot be cleared from client JS, so we
       * call /api/auth/logout to have the server expire it — otherwise a stale
       * credential lingers after disconnect and keeps authenticating requests
       * (e.g. likes).
       */
      signOut: () => {
        posthog.reset()
        posthog.register({ environment: POSTHOG_ENVIRONMENT })
        set(state => {
          state.session = null
          state.error = null
          state.isLoading = false
        })
        // Fire-and-forget: clearing the store is the source of truth for the UI,
        // so a logout network failure must not block sign-out.
        void fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      },
    })),
    {
      name: 'siwe-auth-storage',
      // Version 0 persisted the JWT itself; migrating overwrites it.
      version: 1,
      migrate: () => ({ session: null }),
      // Only persist the session, not loading/error (isAuthenticated is derived)
      partialize: state => ({
        session: state.session,
      }),
      // Clear expired sessions on rehydration
      onRehydrateStorage: () => state => {
        if (state?.session && isSessionExpired(state.session)) {
          state.clearSession()
        }
      },
    },
  ),
)

function isSessionExpired(session: SiweSession): boolean {
  return session.expiresAt <= Date.now()
}

/**
 * Selector to check if user is authenticated
 * Returns true if a session exists and has not expired
 * Use this with useSiweStore to get authentication status
 */
export const selectIsAuthenticated = (state: SiweState): boolean => {
  return state.session !== null && !isSessionExpired(state.session)
}

/**
 * Selector to get the signed-in address
 * Use this with useSiweStore to get the user address
 */
export const selectUserAddress = (state: SiweState): string | null => {
  return state.session?.userAddress ?? null
}
