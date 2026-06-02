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
      posthog.identify(address.toLowerCase(), {
        wallet_address: address.toLowerCase(),
        $set_once: { first_seen: new Date().toISOString() },
      })
      posthog.register({ wallet_address: address.toLowerCase(), user_type: 'wallet' })
    } else {
      posthog.unregister('wallet_address')
      posthog.register({ user_type: 'anonymous' })
    }
  }, [address])

  return <>{children}</>
}
