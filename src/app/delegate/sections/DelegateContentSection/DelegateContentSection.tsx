'use client'
import { useAccount } from 'wagmi'

import { ConnectedSection } from './ConnectedSection'
import { NotConnectedSection } from './NotConnectedSection'

export const DelegateContentSection = () => {
  const { isConnected } = useAccount()

  if (!isConnected) return <NotConnectedSection />

  return <ConnectedSection />
}
