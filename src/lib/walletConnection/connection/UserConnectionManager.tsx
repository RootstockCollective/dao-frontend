'use client'
import { useAccount } from 'wagmi'
import { DisconnectWorkflow } from '@/lib/walletConnection/connection/DisconnectWorkflow'
import { ConnectWorkflow } from '@/lib/walletConnection/connection/ConnectWorkflow'

export function UserConnectionManager() {
  const { isConnected } = useAccount()

  if (isConnected) {
    return <DisconnectWorkflow />
  }

  return <ConnectWorkflow />
}
