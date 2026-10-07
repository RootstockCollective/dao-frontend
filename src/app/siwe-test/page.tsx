'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { useSiweStore } from '@/lib/auth/siweStore'
import { useSignIn } from '@/shared/hooks/useSignIn'

type VerifyResult = { valid: true; userAddress: string } | { valid: false; error: string } | null

export default function SiweTestPage() {
  const { isConnected } = useAccount()
  const { signIn, isLoading, error } = useSignIn()
  const session = useSiweStore(state => state.session)
  const [verifyResult, setVerifyResult] = useState<VerifyResult>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSignIn = async () => {
    setVerifyResult(null)
    await signIn()
  }

  // The JWT stays in the HTTP-only auth-token cookie, which the browser sends with this request.
  const handleVerifyJwt = async () => {
    setIsVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch('/api/auth/verify', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.valid) {
        setVerifyResult({ valid: true, userAddress: data.userAddress })
      } else {
        setVerifyResult({ valid: false, error: data.error || 'Verification failed' })
      }
    } catch (err) {
      setVerifyResult({
        valid: false,
        error: err instanceof Error ? err.message : 'Request failed',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">SIWE Test</h1>
      <p className="text-text-100">
        Connect your wallet, then click the button to sign in with Ethereum. The JWT is set as an HTTP-only
        cookie and never reaches the page.
      </p>

      <Button onClick={handleSignIn} disabled={!isConnected || isLoading} data-testid="siwe-sign-in-button">
        {isLoading ? 'Signing...' : 'Sign in with Ethereum'}
      </Button>

      {!isConnected && <p className="text-sm text-text-200">Connect your wallet first to sign in.</p>}

      {error && (
        <div className="rounded-sm border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-400">Error: {error.message}</p>
        </div>
      )}

      {session && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-green-400">Session:</p>
          <pre className="max-h-48 overflow-auto rounded-sm border border-bg-0 bg-bg-200 p-4 text-xs break-all">
            {session.userAddress} until {new Date(session.expiresAt).toISOString()}
          </pre>
          <Button
            onClick={handleVerifyJwt}
            disabled={isVerifying}
            variant="secondary-outline"
            data-testid="siwe-verify-jwt-button"
          >
            {isVerifying ? 'Verifying...' : 'Verify JWT'}
          </Button>
          {verifyResult && (
            <div
              className={`rounded-sm border p-4 ${
                verifyResult.valid ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
              }`}
            >
              {verifyResult.valid ? (
                <p className="text-sm font-medium text-green-400">
                  Valid. User address: <code className="break-all">{verifyResult.userAddress}</code>
                </p>
              ) : (
                <p className="text-sm font-medium text-red-400">Error: {verifyResult.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
