'use client'
import { NotConnectedSection } from './NotConnectedSection'
import { ConnectedSection } from './ConnectedSection'
import { useAccount } from 'wagmi'

export const DelegateContentSection = () => {
  const { isConnected } = useAccount()

  if (!isConnected) return <NotConnectedSection />

  return <ConnectedSection />
}
