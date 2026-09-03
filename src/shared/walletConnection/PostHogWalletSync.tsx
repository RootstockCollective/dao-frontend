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
      posthog.identify(
        address.toLowerCase(),
        {
          wallet_address: address.toLowerCase(),
        },
        { first_seen: new Date().toISOString() },
      )
      posthog.register({
        wallet_address: address.toLowerCase(),
        user_type: 'wallet',
        auth_status: 'connected',
      })
    } else {
      posthog.unregister('wallet_address')
      posthog.register({ user_type: 'anonymous', auth_status: 'anonymous' })
    }
  }, [address])

  return <>{children}</>
}
