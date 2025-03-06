'use client'
import { useAccount } from 'wagmi'
import { DisconnectWorkflow } from '@/components/UserConnectionWorkflow/connection/DisconnectWorkflow'
import { ConnectWorkflow } from '@/components/UserConnectionWorkflow/connection/ConnectWorkflow'

export function UserConnectionManager() {
  const { isConnected } = useAccount()

  if (isConnected) {
    return <DisconnectWorkflow />
  }

  return <ConnectWorkflow />
}
