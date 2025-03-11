'use client'
import { useAccount } from 'wagmi'
import { DisconnectWorkflow } from './DisconnectWorkflow'
import { ConnectWorkflow } from './ConnectWorkflow'

export function UserConnectionManager() {
  const { isConnected } = useAccount()

  if (isConnected) {
    return <DisconnectWorkflow />
  }

  return <ConnectWorkflow />
}
