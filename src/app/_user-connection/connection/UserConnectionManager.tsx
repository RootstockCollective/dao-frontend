'use client'
import { useAccount } from 'wagmi'
import { DisconnectWorkflow } from '@/app/_user-connection/connection/DisconnectWorkflow'
import { ConnectWorkflow } from '@/app/_user-connection/connection/ConnectWorkflow'

export function UserConnectionManager() {
  const { isConnected } = useAccount()

  if (isConnected) {
    return <DisconnectWorkflow />
  }

  return <ConnectWorkflow />
}
