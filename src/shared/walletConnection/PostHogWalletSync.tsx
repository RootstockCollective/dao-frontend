'use client'
import posthog from 'posthog-js'
import { ReactNode, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface Props {
  children: ReactNode
}

export const PostHogWalletSync = ({ children }: Props) => {
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      posthog.register({ wallet_address: address.toLowerCase() })
    } else {
      posthog.unregister('wallet_address')
    }
  }, [address])

  return <>{children}</>
}
