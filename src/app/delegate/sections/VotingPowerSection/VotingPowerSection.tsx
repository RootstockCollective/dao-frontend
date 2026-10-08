'use client'
import { useAccount } from 'wagmi'

import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'

import { NotConnectedVotingPowerContainer } from './NotConnectedVotingPowerContainer'

export const VotingPowerSection = () => {
  const { isConnected } = useAccount()

  return isConnected ? <ConnectedVotingPowerContainer /> : <NotConnectedVotingPowerContainer />
}

const ConnectedVotingPowerContainer = () => {
  const { cards } = useDelegateContext()

  return <VotingPowerContainer cards={cards} />
}
