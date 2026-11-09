'use client'

import { createContext, ReactNode, useContext } from 'react'

const NonceContext = createContext<string | undefined>(undefined)

interface NonceProviderProps {
  children: ReactNode
  /** The per-request CSP nonce `src/proxy.ts` sets in the `x-nonce` request header; undefined where no policy is applied. */
  nonce?: string
}

/**
 * Makes the request's Content-Security-Policy nonce available to client components.
 *
 * `src/proxy.ts` only allows scripts that carry the nonce (`script-src 'nonce-…' 'strict-dynamic'`).
 * Next.js adds it to the scripts it renders itself, but not to a `<script>` element a component
 * renders, so any inline script a component emits has to read it from here.
 */
export const NonceProvider = ({ nonce, children }: NonceProviderProps) => (
  <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
)

/** The CSP nonce of the current request, or undefined outside a NonceProvider (tests, Storybook). */
export const useNonce = () => useContext(NonceContext)
