'use client'

import { createContext, ReactNode, useContext, useEffect, useRef } from 'react'
import { MockBtcVaultAdapter } from '../services/mock/MockBtcVaultAdapter'
import type { BtcVaultAdapter } from '../services/types'

/**
 * React context for providing the BtcVaultAdapter instance to descendant components.
 *
 * Mock-specific: This context is only used by mock hook implementations (*.mock.ts).
 * Contract hooks use useReadContract/useWriteContract directly and do not need this context.
 * When NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE=contract, this provider still renders but is not consumed.
 */
export const MockBtcVaultContext = createContext<BtcVaultAdapter | null>(null)

/**
 * Provider that creates a singleton BtcVaultAdapter instance and makes it available via context.
 * Disposes the adapter on unmount to clean up subscriptions and timers.
 *
 * Mock-specific: This provider exists to share a single MockBtcVaultAdapter instance across
 * all mock hooks. The mock adapter is stateful (epoch timers, in-memory request store) so it
 * must be a singleton. Contract hooks bypass this entirely — they call the blockchain directly
 * via wagmi hooks.
 */
export const MockBtcVaultProvider = ({ children }: { children: ReactNode }) => {
  const adapterRef = useRef<BtcVaultAdapter | null>(null)

  if (adapterRef.current === null) {
    adapterRef.current = new MockBtcVaultAdapter()
  }

  useEffect(() => {
    return () => {
      adapterRef.current?.dispose()
      adapterRef.current = null
    }
  }, [])

  return <MockBtcVaultContext.Provider value={adapterRef.current}>{children}</MockBtcVaultContext.Provider>
}

/**
 * Returns the MockBtcVaultAdapter instance from context.
 *
 * Mock-specific: Only used by *.mock.ts hooks. Contract hooks use useReadContract/useWriteContract
 * directly and do not call this hook.
 * @throws Error if used outside of MockBtcVaultProvider
 */
export function useMockBtcVaultAdapter(): BtcVaultAdapter {
  const adapter = useContext(MockBtcVaultContext)
  if (!adapter) {
    throw new Error('useMockBtcVaultAdapter must be used within MockBtcVaultProvider')
  }
  return adapter
}
