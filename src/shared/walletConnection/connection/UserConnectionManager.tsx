'use client'
import { DisconnectWorkflowContainer } from './DisconnectWorkflowContainer'
import { ConnectWorkflow } from './ConnectWorkflow'
import { useState, useEffect, type ReactNode } from 'react'
import { useAccount } from 'wagmi'

interface UserConnectionManagerProps {
  className?: string
  showContent?: boolean
}

/**
 * UserConnectionManager handles wallet connection state in a Next.js environment.
 *
 * HYDRATION SAFETY PATTERN:
 * Even though Next.js components with 'use client' directive are client components,
 * they still undergo server-side rendering (SSR) initially before hydration on the client.
 *
 * This creates potential hydration mismatches with Wagmi hooks because:
 * 1. During SSR: Wagmi hooks have no access to browser APIs, wallets, or connection state
 * 2. During client hydration: These hooks can access browser environment and return values
 *
 * The mounted/useEffect pattern prevents hydration mismatches by:
 * - Rendering nothing during the initial server render
 * - Only rendering the full component with Wagmi hook values after client-side hydration is complete
 * - This ensures the server and client renders match exactly, avoiding React hydration errors
 *
 * Without this pattern, you may encounter errors like:
 * "Text content does not match server-rendered HTML" or
 * "Hydration failed because the initial UI does not match what was rendered on the server"
 */
export function UserConnectionManager({ className, showContent = true }: UserConnectionManagerProps) {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  // Use effect to mark when component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const shouldRender = mounted && showContent
  let content: ReactNode = null

  if (shouldRender) {
    content = isConnected ? <DisconnectWorkflowContainer /> : <ConnectWorkflow />
  }

  return <div className={className}>{content}</div>
}
